import { z } from "zod";

/** 1) Canonical stored shape (DB/UI read model) */
export const UserDetailsSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().trim().min(1).max(200),
  lastName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),

  location: z.string().trim().max(200).optional(),
  headline: z.string().trim().max(200).optional(),
  portfolioUrl: z.string().trim().url().max(2048).optional(),
  linkedinUrl: z.string().trim().url().max(2048).optional(),
  githubUrl: z.string().trim().url().max(2048).optional(),

  defaultTone: z.enum(["short", "enthusiastic", "assertive", "neutral"]).optional(),
  defaultSignOff: z.string().trim().max(100).optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserDetails = z.infer<typeof UserDetailsSchema>;

/** 2) Form/input shape (what your UI submits) 
 * take the schema used to create the record, omit the stuff the UI doesn't need to render.
 * id is extended as optional because we might update the userdetails table using it
*/
export const UpsertUserDetailsInputSchema = UserDetailsSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().uuid().optional(),
  })
  .strict();

export type UpsertUserDetailsInput = z.infer<typeof UpsertUserDetailsInputSchema>;
