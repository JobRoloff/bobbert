import { getEnv } from "./env"
import { hashIp } from "./hashing"
import { prisma } from "./prisma"

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const env = getEnv()
  const ipHash = hashIp(ip)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  // Count requests in the last hour
  const count = await prisma.messageRequest.count({
    where: {
      ipHash,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  })

  const limit = env.RATE_LIMIT_PER_HOUR
  const remaining = Math.max(0, limit - count)
  const resetAt = new Date(Date.now() + 60 * 60 * 1000)

  return {
    allowed: count < limit,
    remaining,
    resetAt,
  }
}
