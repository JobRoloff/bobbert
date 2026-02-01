// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  // 1. Load the JSON file
  const filePath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const emails = JSON.parse(rawData);

  console.log(`🚀 Starting seed: ${emails.length} emails found.`);

  for (const email of emails) {
    // 2. Perform upsert based on the unique gmailMessageId
    await prisma.jobEmail.upsert({
      where: { gmailMessageId: email.gmailMessageId },
      update: {}, // Keep existing data if it exists
      create: {
        gmailMessageId: email.gmailMessageId,
        subject: email.subject,
        sender: email.sender,
        senderEmail: email.senderEmail,
        // Convert string date from JSON to JS Date object
        receivedAt: new Date(email.receivedAt),
        snippet: email.snippet,
        bodyText: email.bodyText,
        bodyHTML: email.bodyHTML,
        status: email.status,
        source: email.source,
        company: email.company,
        role: email.role,
        externalUrl: email.externalUrl,
        // If your Prisma schema supports the other fields in the JSON
        // like gmailThreadId or gmailLabelIds, add them here.
      },
    });
  }

  console.log('✅ Seeding successful.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });