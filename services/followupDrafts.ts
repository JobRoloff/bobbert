// /services/followupDrafts.ts
import "server-only"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { FollowUpChannel, FollowUpDraftStatus } from "@prisma/client"

type UpsertDraftArgs = {
  jobEmailId: string
  channel: FollowUpChannel
  status?: FollowUpDraftStatus
  subject?: string
  body?: string
  isGenerated?: boolean
  rationale?: string | null
  model?: string | null
  tone?: string | null
}
const todoSelect = Prisma.validator<Prisma.FollowUpDraftSelect>()({
  id: true,
  jobEmailId: true,
  jobEmail: {
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      appliedDate: true,
    },
  },
} as const)
export async function getExistingDraft(params: {
  jobEmailId: string
  channel: FollowUpChannel
  status?: FollowUpDraftStatus
}) {
  const { jobEmailId, channel, status = "DRAFT" } = params

  return prisma.followUpDraft.findUnique({
    where: {
      // This matches @@unique([jobEmailId, channel, status])
      jobEmailId_channel_status: { jobEmailId, channel, status },
    },
  })
}

export async function upsertDraft(args: UpsertDraftArgs) {
  const {
    jobEmailId,
    channel,
    status = "DRAFT",
    subject,
    body,
    isGenerated,
    rationale = null,
    model = null,
    tone = null,
  } = args

  return prisma.followUpDraft.upsert({
    where: {
      jobEmailId_channel_status: { jobEmailId, channel, status },
    },
    update: {
      subject,
      body,
      isGenerated,
      rationale,
      model,
      tone,
    },
    create: {
      jobEmailId,
      channel,
      status,
      subject,
      body,
      isGenerated: isGenerated ?? false,
      rationale,
      model,
      tone,
    },
  })
}

export async function seedDueFollowUpDrafts(args?: {
  days?: number
  channel?: FollowUpChannel
  status?: FollowUpDraftStatus
}) {
  const days = args?.days ?? 3
  const channel = args?.channel ?? "EMAIL"
  const status = args?.status ?? "DRAFT"

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const dueJobEmails = await prisma.jobEmail.findMany({
    where: {
      status: "APPLIED",
      appliedDate: { not: null, lte: cutoff },
    },
    select: { id: true },
  })

  if (dueJobEmails.length === 0) return { created: 0 }

  const res = await prisma.followUpDraft.createMany({
    data: dueJobEmails.map((e) => ({
      jobEmailId: e.id,
      channel,
      status,
      subject: null,
      body: null,
      isGenerated: false,
    })),
    skipDuplicates: true,
  })

  // createMany returns { count }
  return { created: res.count }
}
export type TodoDraft = Prisma.FollowUpDraftGetPayload<{
  select: typeof todoSelect
}>



export async function getTodosToDraft(
  args?: { channel?: FollowUpChannel }
): Promise<TodoDraft[]> {
  const channel = args?.channel ?? "EMAIL"

  const rows = await prisma.followUpDraft.findMany({
    where: {
      channel,
      status: "DRAFT",
      isGenerated: false,
    },
    select: todoSelect,
    orderBy: { createdAt: "desc" },
  })

  // Accelerate client sometimes widens return types; this cast re-narrows to the select payload.
  return rows as unknown as TodoDraft[]
}
