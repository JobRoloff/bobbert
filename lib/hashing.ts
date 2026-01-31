import { createHash } from "crypto"

export function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

export function hashPhone(phone: string): string {
  return hashString(phone)
}

export function hashUrl(url: string): string {
  return hashString(url)
}

export function getLast4(input: string): string {
  if (input.length <= 4) {
    return input
  }
  return input.slice(-4)
}

export function hashIp(ip: string): string {
  return hashString(ip)
}
