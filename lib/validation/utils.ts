import z from "zod"

// E.164 phone number validation
export const E164_REGEX = /^\+[1-9]\d{1,14}$/

export function validatePhone(phone: string): boolean {
  return E164_REGEX.test(phone)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return url.length <= 2048
  } catch {
    return false
  }
}

export const phoneSchema = z
  .string()
  .regex(E164_REGEX, "Phone number must be in E.164 format (e.g., +1234567890)")


  export const urlSchema = z
    .string()
    .url("Must be a valid URL")
    .max(2048, "URL must be less than 2048 characters")