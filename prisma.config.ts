// prisma.config.ts
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema/schema.prisma",
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    // Use your *direct* postgres URL here (Vercel's POSTGRES_URL)
    url: env("DIRECT_DATABASE_URL"),

    // optional: only if you use shadow DB workflows
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
})
