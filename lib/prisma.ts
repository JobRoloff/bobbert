// lib/prisma.ts
import "server-only"
import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const createPrismaClient = () =>
  new PrismaClient({
    // IMPORTANT: this should be your Accelerate connection string (usually prisma://...)
    // not your direct postgres:// connection string.
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL,
  }).$extends(withAccelerate())

type PrismaClientWithAccelerate = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientWithAccelerate
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma as any
