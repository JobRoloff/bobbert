// services/gmail.ts

import { google, gmail_v1 } from "googleapis"
import { simpleParser, type ParsedMail, type AddressObject } from "mailparser"
import { htmlToText } from "@/lib/html-to-text"
import type { UpsertJobEmailInput } from "@/lib/validation/JobEmail/JobEmail"
import { JobEmailSourceSchema, JobEmailStatusSchema } from "@/lib/validation/JobEmail/JobEmail"

// Configuration interfaces
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
  async fetchNewJobApplicationEmails(maxResults: number = 20): Promise<UpsertJobEmailInput[]> {
    try {
      const gmail = google.gmail({ version: "v1", auth: this.auth })

      // Improved Query: Search for any of the supported providers
      // You can refine this using "subject:" filters if you get too much noise.
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

      if (!listResponse.data.messages || listResponse.data.messages.length === 0) {
        return []
      }

      const messages = listResponse.data.messages

      // Note: For very large maxResults (>50), consider using p-limit to avoid rate limits
      const emailPromises = messages
        .filter((msg) => msg.id) // Ensure ID exists
        .map((msg) => this.fetchAndParseOne(gmail, msg.id!))

      return await Promise.all(emailPromises)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error("Error fetching Gmail messages:", errorMsg)
      throw new Error(`Failed to read emails: ${errorMsg}`)
    }
  }

  
  private async fetchAndParseOne(
    gmail: gmail_v1.Gmail,
    messageId: string
  ): Promise<UpsertJobEmailInput> {
    let detail: gmail_v1.Schema$Message

    try {
      const res = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "raw", // Raw is required for mailparser
      })
      detail = res.data
    } catch (err) {
      console.error(`Gmail get failed for message ${messageId}:`, err)
      return this.fallbackMessage(messageId, "Error retrieving message content")
    }

    const rawB64 = detail.raw
    const snippet = detail.snippet || null

    if (!rawB64) {
      return this.fallbackMessage(messageId, snippet)
    }

    let parsed: ParsedMail
    try {
      const raw = decodeBase64Url(rawB64)
      parsed = await simpleParser(raw)
    } catch (err) {
      console.error(`mailparser failed for message ${messageId}:`, err)
      return this.fallbackMessage(messageId, snippet)
    }

    // Extraction Logic
    const subject = parsed.subject?.trim() || "No Subject"

    // mailparser normalizes 'from' into an object or array of objects
    const fromAddress = this.extractAddressObject(parsed.from)
    const sender = fromAddress?.name || fromAddress?.address || "Unknown Sender"
    const senderEmail = fromAddress?.address || null

    const receivedAt = parsed.date || new Date()

    // Body Priority: Text -> HTML converted -> Snippet
    let bodyText: string | null = parsed.text?.trim() || null
    if (!bodyText && parsed.html) {
      bodyText = htmlToText(parsed.html as string).trim() || null
    }
    if (!bodyText && snippet) {
      bodyText = snippet
    }

    const bodyHTML = typeof parsed.html === "string" ? parsed.html.trim() : null
    const source = this.inferSource(sender, senderEmail, bodyText)

    return {
      gmailMessageId: messageId,
      subject,
      sender,
      senderEmail,
      receivedAt,
      snippet,
      bodyText,
      bodyHTML,
      status: JobEmailStatusSchema.enum.NEW,
      source,
      company: null, // To be extracted by LLM later
      role: null, // To be extracted by LLM later
      externalUrl: null,
    }
  }

  /**
   * Helper to safely extract the first address object from mailparser's structure
   */
  private extractAddressObject(from: ParsedMail["from"]): AddressObject["value"][0] | null {
    if (!from) return null

    // 'from' is usually an object with a 'value' array
    if (typeof from === "object" && "value" in from && Array.isArray(from.value)) {
      return from.value[0] || null
    }

    return null
  }

  private fallbackMessage(messageId: string, snippet: string | null): UpsertJobEmailInput {
    return {
      gmailMessageId: messageId,
      subject: "No Subject",
      sender: "Unknown Sender",
      senderEmail: null,
      receivedAt: new Date(),
      snippet,
      bodyText: snippet,
      bodyHTML: null,
      status: JobEmailStatusSchema.enum.NEW,
      source: JobEmailSourceSchema.enum.OTHER,
      company: null,
      role: null,
      externalUrl: null,
    }
  }

  private inferSource(
    senderName: string,
    senderEmail: string | null,
    bodyText: string | null
  ): "LINKEDIN" | "HANDSHAKE" | "INDEED" | "GLASSDOOR" | "OTHER" {
    const combined = `${senderName} ${senderEmail || ""} ${bodyText || ""}`.toLowerCase()

    if (combined.includes("linkedin")) return JobEmailSourceSchema.enum.LINKEDIN
    if (combined.includes("handshake")) return JobEmailSourceSchema.enum.HANDSHAKE
    if (combined.includes("indeed")) return JobEmailSourceSchema.enum.INDEED
    if (combined.includes("glassdoor")) return JobEmailSourceSchema.enum.GLASSDOOR

    return JobEmailSourceSchema.enum.OTHER
  }
}
