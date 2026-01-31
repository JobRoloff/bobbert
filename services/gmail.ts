// services/gmail.ts
/**
 * uses the GOOGLE_API_KEY environment variable and the gmail api to read emails from job applications: linkedin, handshake,
 */

import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"
import type { UpsertJobEmailInput } from "@/lib/validation/JobEmail/JobEmail"
import {
  JobEmailSourceSchema,
  JobEmailStatusSchema,
} from "@/lib/validation/JobEmail/JobEmail"

// Configuration interfaces
export interface GmailServiceConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  redirectUri?: string
}

export class GmailService {
  private auth: OAuth2Client

  constructor(config: GmailServiceConfig) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || "https://developers.google.com/oauthplayground"
    )

    this.auth.setCredentials({
      refresh_token: config.refreshToken,
    })
  }

  /**
   * The main tool function to be exposed to the OpenAI Agent.
   * Scans for job application emails from specific domains or keywords.
   */
  async fetchJobApplicationEmails(maxResults: number = 20): Promise<UpsertJobEmailInput[]> {
    try {
      const gmail = google.gmail({ version: "v1", auth: this.auth })

      // 1. Construct a targeted query for job platforms
      // You can expand this list (e.g., Indeed, Glassdoor, etc.)
      const query = [
        "from:LinkedIn <jobs-noreply@linkedin.com>",
      ].join(" ")

      // 2. List message IDs
      const listResponse = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: maxResults,
      })

      if (!listResponse.data.messages || listResponse.data.messages.length === 0) {
        return []
      }

      // 3. Fetch full details for each message
      const emailPromises = listResponse.data.messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full", // 'full' is needed to get the body content
        })
        return this.parseEmail(detail.data)
      })

      return await Promise.all(emailPromises)
    } catch (error: any) {
      console.error("Error fetching Gmail messages:", error?.message)

      // google-auth-library often includes these
      console.error("Error response data:", error?.response?.data)
      console.error("Error response status:", error?.response?.status)

      throw new Error(
        `Failed to read emails: ${error?.response?.data?.error ?? error?.message ?? "Unknown error"}`
      )
    }
  }

  /**
   * Helper: Parses the complex Gmail API response object into UpsertJobEmailInput format
   */
  private parseEmail(message: any): UpsertJobEmailInput {
    const headers = message.payload?.headers ?? []

    // Extract metadata
    const subject =
      headers.find((h: any) => h.name === "Subject")?.value || "No Subject"
    const fromHeader =
      headers.find((h: any) => h.name === "From")?.value || "Unknown Sender"
    const dateStr = headers.find((h: any) => h.name === "Date")?.value || ""

    // Extract sender email from "Name <email@domain.com>" if present
    const senderEmailMatch = fromHeader.match(/<([^>]+)>/)
    const senderEmail = senderEmailMatch?.[1] ?? null
    const sender = fromHeader

    // Parse received date
    const receivedAt = dateStr ? new Date(dateStr) : new Date()

    // Extract body text and HTML (Gmail bodies can be multipart/alternative)
    let bodyText = ""
    if (message.payload.parts) {
      const { text } = this.extractBodyFromParts(message.payload.parts)
      bodyText = text
    } else if (message.payload.body?.data) {
      const normalizeBase64 = (s: string) =>
        s.replace(/-/g, "+").replace(/_/g, "/")
      bodyText = Buffer.from(
        normalizeBase64(message.payload.body.data),
        "base64"
      ).toString("utf-8")
    }
    bodyText = bodyText || message.snippet || null

    // Infer source from sender/domain
    const source = this.inferSource(fromHeader)

    return {
      gmailMessageId: message.id,

      subject,
      sender,
      senderEmail,
      receivedAt,
      snippet: message.snippet ?? null,
      bodyText: bodyText || null,

      status: JobEmailStatusSchema.enum.NEW,
      source,

      company: null,
      role: null,
      externalUrl: null,
    }
  }

  /**
   * Infers job email source from sender address or display name
   */
  private inferSource(sender: string): "LINKEDIN" | "HANDSHAKE" | "INDEED" | "GLASSDOOR" | "OTHER" {
    const lower = sender.toLowerCase()
    if (lower.includes("linkedin")) return JobEmailSourceSchema.enum.LINKEDIN
    if (lower.includes("handshake")) return JobEmailSourceSchema.enum.HANDSHAKE
    if (lower.includes("indeed")) return JobEmailSourceSchema.enum.INDEED
    if (lower.includes("glassdoor")) return JobEmailSourceSchema.enum.GLASSDOOR
    return JobEmailSourceSchema.enum.OTHER
  }

  /**
   * Recursive helper to find text/plain and text/html content in multipart emails
   */
  private extractBodyFromParts(parts: any[]): {
    text: string
    html: string | null
  } {
    let text = ""
    let html: string | null = null

    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        const normalizeBase64 = (s: string) =>
          s.replace(/-/g, "+").replace(/_/g, "/")
        text += Buffer.from(
          normalizeBase64(part.body.data),
          "base64"
        ).toString("utf-8")
      } else if (part.mimeType === "text/html" && part.body?.data) {
        const normalizeBase64 = (s: string) =>
          s.replace(/-/g, "+").replace(/_/g, "/")
        html = Buffer.from(
          normalizeBase64(part.body.data),
          "base64"
        ).toString("utf-8")
      } else if (part.parts) {
        const nested = this.extractBodyFromParts(part.parts)
        text += nested.text
        if (nested.html) html = nested.html
      }
    }

    return { text, html }
  }
}
