import {z} from "zod"

export const settingsFormSchema = z.object({
  name: z.string().min(1).max(100),
  companyName: z.string().min(1).max(100),
})
export type SettingsFormData = z.infer<typeof settingsFormSchema>