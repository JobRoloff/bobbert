/**
 * zod is used to ensure certain environment variables are present at runtime
 * 
 * this may seem overkill considering a build failure in vercel will tell us what went wrong, but this nott only tells us prior to build, but we also gain the following benefit in the codebase
 * 
 * less lines like the following
 * 
 * process.env.VARIABLE_NAME!
 * 
 */
import { z } from "zod"

/**
 * regex tto check the shape of the input. it doesn't validate if numbers are valid for a region. to do thatt, use a library such as libphonenumber-js
 */
export const e164 = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{1,14}$/, { message: "Must be E.164 (e.g. +14155552671)" });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_MESSAGING_SERVICE_SID: z.string().min(1),
  // TWILIO_NUMBER: e164,
  RCS_SENDER_ID: z.string(),
  DEMO_TOKEN: z.string().min(1),
  DEMO_ALLOWLIST_E164: z.string().transform((s) => s.split(",").map(x => x.trim()).filter(Boolean)).pipe(z.array(e164).min(1)),
  RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(20),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
})

/**
 * use the z.infer typescript helper to derive our typescript type from the above zod object schema
 */
export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv
  }

  // parse the runtime environment file to our zod object
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables: ${parsed.error.flatten().fieldErrors}`
    )
  }

  cachedEnv = parsed.data
  return cachedEnv
}

/**
 * 
 * @returns a list of accounts we're allowing messages to be sent to
 */
export function getAllowlist(): string[] {
  const env = getEnv()
  return env.DEMO_ALLOWLIST_E164
    .map((phone) => phone.trim())
    .filter((phone) => phone.length > 0)
}
