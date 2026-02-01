// lib/prisma.ts
import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // this should be the prisma+postgres URL
    accelerateUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate())

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma as any
