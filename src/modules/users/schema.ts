import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const verifySchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/),
});
