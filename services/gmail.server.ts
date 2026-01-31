import "server-only"
import { GmailService } from "./gmail"
import type { GmailServiceConfig } from "./gmail"

export function getGmailService() {
  const config: GmailServiceConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  }

  for (const [key, value] of Object.entries(config)) {
    if (key !== "redirectUri" && !value) throw new Error(`Missing env var for Gmail: ${key}`)
  }
  // Optional: validate envs (zod) and throw early
  return new GmailService(config)
}
