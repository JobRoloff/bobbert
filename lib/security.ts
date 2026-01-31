import { getEnv, getAllowlist } from "./env"

export function validateDemoToken(token: string | null | undefined): boolean {
  if (!token) {
    return false
  }

  const env = getEnv()
  return token === env.DEMO_TOKEN
}

export function isPhoneAllowed(phone: string): boolean {
  const allowlist = getAllowlist()
  return allowlist.includes(phone)
}

export function getClientIp(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback (won't work in production but helps in dev)
  return "127.0.0.1"
}
