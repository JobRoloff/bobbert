// lib/validation/JobEmail/JobEmail.ts

import { z } from "zod";

export const JobEmailStatusSchema = z.enum([
  "NEW",
  "TRIAGED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
]);

export const JobEmailSourceSchema = z.enum([
  "LINKEDIN",
  "HANDSHAKE",
  "INDEED",
  "GLASSDOOR",
  "OTHER",
]);

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
  sender: z.string().min(1),
  senderEmail: z.string().email().optional().nullable(),
  receivedAt: z.coerce.date(),
  snippet: z.string().optional().nullable(),

  bodyText: z.string().optional().nullable(),
  bodyHTML: z.string().optional().nullable(),

  status: JobEmailStatusSchema,
  source: JobEmailSourceSchema,

  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
});

export type JobEmail = z.infer<typeof JobEmailSchema>;

/**
 For creating/upserting (server-side)
 */
export const UpsertJobEmailInputSchema = z.object({
  gmailMessageId: z.string().min(1),

  subject: z.string().min(1),
  sender: z.string().min(1),
  senderEmail: z.string().email().optional().nullable(),
  receivedAt: z.coerce.date(),
  snippet: z.string().optional().nullable(),

  bodyText: z.string().optional().nullable(),
  bodyHTML: z.string().optional().nullable(),

  status: JobEmailStatusSchema.optional(),
  source: JobEmailSourceSchema.optional(),

  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
});
export type UpsertJobEmailInput = z.infer<typeof UpsertJobEmailInputSchema>;
