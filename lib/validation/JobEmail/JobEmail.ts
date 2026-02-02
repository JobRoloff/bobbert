// lib/validation/JobEmail/JobEmail.ts

import { z } from "zod"

export const JobEmailStatusSchema = z.enum([
  "NEW",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
])

export const JobSchema = z.object({
  id: z.string().uuid().optional(), // present when read from DB
  createdAt: z.coerce.date().optional(), // present when read from DB

  role: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  applicationLink: z.string().url().optional().nullable(),
})

/**
 * 
For reading rows safely (e.g. rendering)
 */
export const JobEmailSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  gmailMessageId: z.string().min(1),
  subject: z.string().min(1),

  status: JobEmailStatusSchema,

  appliedDate: z.coerce.date().optional().nullable(),
  roleTitle: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  applicationLink: z.string().url().optional().nullable(),
  jobLink: z.string().url().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),

  recommendedJobs: z.array(JobSchema).optional().default([]),
})

export type JobEmail = z.infer<typeof JobEmailSchema>

/**
 For creating/upserting (server-side)
 */
export const UpsertJobEmailInputSchema = z.object({
  gmailMessageId: z.string().min(1),
  subject: z.string().min(1),

  status: JobEmailStatusSchema.optional(),

  appliedDate: z.coerce.date().optional().nullable(),
  companyName: z.string().optional().nullable(),
  roleTitle: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  
  applicationLink: z.string().url().optional().nullable(),
  jobLink: z.string().url().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),

  // if you plan to create recommended jobs in same call
  recommendedJobs: z.array(JobSchema.omit({ id: true, createdAt: true })).optional(),
  role: z.string().optional().nullable(),
})
export type UpsertJobEmailInput = z.infer<typeof UpsertJobEmailInputSchema>
