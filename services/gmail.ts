// services/gmail.ts
import "server-only"
import { google, gmail_v1 } from "googleapis"
import OpenAI from "openai"
import { simpleParser, type ParsedMail, type AddressObject } from "mailparser"
import { htmlToText, parseEmailHtmlToObject } from "@/lib/html-to-text"
import type { UpsertJobEmailInput } from "@/lib/validation/JobEmail/JobEmail"
import { JobEmailStatusSchema } from "@/lib/validation/JobEmail/JobEmail"

export interface GmailServiceConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  redirectUri?: string
}

/**
 * Decodes Gmail base64url to UTF-8 string (- → +, _ → /).
 */
function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(normalized, "base64").toString("utf-8")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

type LlmExtract = {
  status: zodEnumValue<typeof JobEmailStatusSchema> // helper type below
  appliedDate: string | null // ISO date string or null
  company: string | null
  role: string | null
  location: string | null
  jobLink: string | null
  externalUrl: string | null
}

type zodEnumValue<T extends { enum: Record<string, string> }> = T["enum"][keyof T["enum"]]

export class GmailService {
  private auth: import("google-auth-library").OAuth2Client

  constructor(config: GmailServiceConfig) {
    const oauth2 = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || "https://developers.google.com/oauthplayground"
    )
    oauth2.setCredentials({
      refresh_token: config.refreshToken,
    })
    this.auth = oauth2
  }
  /**
   * Scans for job application emails from supported domains.
   */
  async pollNewJobApplicationEmails(maxResults: number = 20): Promise<UpsertJobEmailInput[]> {
    try {
      const gmail = google.gmail({ version: "v1", auth: this.auth })

      const query = `
        (from:<jobs-noreply>@linkedin.com)
      `
        .replace(/\s+/g, " ")
        .trim()

      const listResponse = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: maxResults,
      })

      const messages = listResponse.data.messages ?? []
      if (messages.length === 0) return []

      const jobs = messages
        .filter((m) => m.id)
        .map(async (m) => {
          const messageId = m.id!
          const { rawB64, snippet } = await this.fetchMessageRaw(gmail, messageId)
          return this.parseMessageToUpsert({ messageId, rawB64, snippet })
        })

      const results = await Promise.allSettled(jobs)
      const output : UpsertJobEmailInput[] = results
        .filter((r): r is PromiseFulfilledResult<UpsertJobEmailInput> => r.status === "fulfilled")
        .map((r) => r.value)
      console.log("polled emails: ", output)
      return output
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error("Error fetching Gmail messages:", errorMsg)
      throw new Error(`Failed to read emails: ${errorMsg}`)
    }
  }
  /** Fetch only. No parsing. */
  private async fetchMessageRaw(
    gmail: gmail_v1.Gmail,
    messageId: string
  ): Promise<{ rawB64: string | null; snippet: string | null }> {
    try {
      const res = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "raw",
      })
      return {
        rawB64: res.data.raw ?? null,
        snippet: res.data.snippet ?? null,
      }
    } catch (err) {
      console.error(`Gmail get failed for message ${messageId}:`, err)
      return { rawB64: null, snippet: null }
    }
  }
  

  /** Parse + infer. No fetching. */
  private async parseMessageToUpsert(args: {
    messageId: string
    rawB64: string | null
    snippet: string | null
  }): Promise<UpsertJobEmailInput> {
    const { messageId, rawB64, snippet } = args

    if (!rawB64) {
      return {
        gmailMessageId: messageId,
        subject: "No Subject",
        status: JobEmailStatusSchema.enum.NEW,
        appliedDate: null,
        role: null,
        jobLink: null,
        externalUrl: null,
        location: null,
      }
    }

    let mail: ParsedMail
    try {
      const raw = decodeBase64Url(rawB64)
      mail = await simpleParser(raw)
    } catch (err) {
      console.error(`mailparser failed for message ${messageId}:`, err)
      return {
        gmailMessageId: messageId,
        subject: "No Subject",
        status: JobEmailStatusSchema.enum.NEW,
        appliedDate: null,
        role: null,
        jobLink: null,
        externalUrl: null,
        location: null,
      }
    }

    const subject = mail.subject?.trim() || "No Subject"
    const html = typeof mail.html === "string" ? mail.html : null

    // Canonical “content” for inference: HTML -> parsed object -> plainText
    const htmlParsed = html
      ? parseEmailHtmlToObject({ html, gmailMessageId: messageId })
      : null

    const primaryText =
      htmlParsed?.plainText?.trim() ||
      mail.text?.trim() ||
      snippet ||
      ""

    // Deterministic fallback links
    const bestApply = htmlParsed?.links?.find((l) => l.kind === "apply")?.href ?? null
    const bestExternal = htmlParsed?.originalEmail?.gmailUrl ?? null

    // LLM extraction (this is your “agentic parsing” step)
    const llm = await this.extractJobFieldsWithLLM({
      subject,
      primaryText,
      applyLinkHint: bestApply,
    })

    // Merge: LLM result + deterministic hints
    const jobLink = llm.jobLink ?? bestApply
    const externalUrl = llm.externalUrl ?? bestExternal
    const output : UpsertJobEmailInput = {
      gmailMessageId: messageId,
      subject,
      status: llm.status ?? JobEmailStatusSchema.enum.NEW,
      appliedDate: llm.appliedDate ? new Date(llm.appliedDate) : null,
      companyName: llm.company,
      roleTitle: llm.role,
      location: llm.location,
      applicationLink: jobLink,
      externalUrl: externalUrl,
    }
    // console.log("parsed email: ", output)
    return output
  }

  /**
   * Uses OpenAI to extract structured job application fields from email content.
   * Treat HTML-derived plain text as source of truth.
   */
  private async extractJobFieldsWithLLM(input: {
    subject: string
    primaryText: string
    applyLinkHint: string | null
  }): Promise<{
    status: zodEnumValue<typeof JobEmailStatusSchema>
    appliedDate: string | null
    company: string | null
    role: string | null
    location: string | null
    jobLink: string | null
    externalUrl: string | null
  }> {
    requireEnv("OPENAI_API_KEY")
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini"

    // Keep the context small to avoid cost + hallucination
    const content = input.primaryText.slice(0, 8000)

    const system = `
You extract structured job-application data from job-related emails (e.g., LinkedIn job apply confirmations, interview requests).
Return ONLY valid JSON with the exact keys:
{
  "status": "NEW" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED" | "ARCHIVED",
  "appliedDate": string | null,   // ISO-8601 date (YYYY-MM-DD) if clearly present
  "company": string | null,
  "role": string | null,
  "location": string | null,
  "jobLink": string | null,       // link to application / job posting if present
  "externalUrl": string | null    // optional
}

Rules:
- If unsure, use null for fields.
- Do NOT invent company/role.
- Prefer explicit evidence (e.g. "You applied to X at Y").
- If the message is clearly a rejection, status should be REJECTED.
- If it’s an interview invite/scheduling, status should be INTERVIEW.
- If it’s an application confirmation, status should be APPLIED.
`.trim()

    const user = `
SUBJECT:
${input.subject}

APPLY_LINK_HINT (may be null):
${input.applyLinkHint ?? "null"}

EMAIL_TEXT:
${content}
`.trim()

    const resp = await openai.responses.create({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    })

    const text = resp.output_text?.trim() || "{}"

    // Very defensive parse
    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch {
      // fallback: if model wrapped in text, try to extract JSON block
      const match = text.match(/\{[\s\S]*\}/)
      parsed = match ? JSON.parse(match[0]) : {}
    }

    // Normalize + validate status
    const status = JobEmailStatusSchema.safeParse(parsed.status).success
      ? parsed.status
      : JobEmailStatusSchema.enum.NEW

    // Basic normalization for appliedDate
    const appliedDate =
      typeof parsed.appliedDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.appliedDate)
        ? parsed.appliedDate
        : null

    const asNullString = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null)

    return {
      status,
      appliedDate,
      company: asNullString(parsed.company),
      role: asNullString(parsed.role),
      location: asNullString(parsed.location),
      jobLink: asNullString(parsed.jobLink),
      externalUrl: asNullString(parsed.externalUrl),
    }
  }

}
