import { randomBytes } from "crypto"

export function generateRequestId(): string {
  return randomBytes(16).toString("hex")
}
