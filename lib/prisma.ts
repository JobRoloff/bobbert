import { PrismaClient } from "@prisma/client"

/**
 * A prisma singleton is used especially in dev mode because in dev, we use hot-reload. When we use hot-reload without a singleton, MANY db connections could be made.
 * 
 * in Typescript, globalThis is a place to store the singletion object.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

// this line enables dev caching of the prisma connection by writing the singleton onto globalThis. So in production when this line does not run, we don't use the singleton pattern.. In prod the singleton isn't needed because in serverless environments, each instance/process has its own memory regardless, so a "global singleton" can't be shared across instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
