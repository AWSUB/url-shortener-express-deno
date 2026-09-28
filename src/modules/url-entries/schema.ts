import { z } from "zod";

export const createUrlSchema = z.object({
  original_url: z.url(),
  custom_code: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, digits, hyphens and underscores allowed")
    .optional(),
  expires_at: z.iso.datetime({ offset: true }).optional(),
});

export const shortCodeParamSchema = z.object({
  code: z.string().min(1),
});

export const urlIdParamSchema = z.object({
  id: z.uuid(),
});
