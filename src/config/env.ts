import { z } from "zod";

// required and non-empty: your .env has `JWT_ACCESS_SECRET=`, an empty
// secret would otherwise sign tokens happily.
const req = z.string().min(1);

const schema = z.object({
  APP_ENV: z.string().default("development"),
  APP_HOST: z.string().default("localhost"),
  APP_PORT: z.coerce.number().default(3000),

  POSTGRES_HOST: req,
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_DB: req,
  POSTGRES_USER: req,
  POSTGRES_PASSWORD: req,

  REDIS_HOST: req,
  REDIS_PORT: z.coerce.number(),
  REDIS_USER: req,
  REDIS_PASSWORD: req,

  MAIL_FROM: req,

  SMTP_HOST: req,
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_AUTH: z.stringbool().default(true),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),

  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(600),

  JWT_ACCESS_SECRET: req,
  JWT_EXPIRATION: req,
})

export type Env = z.infer<typeof schema>;

export const APP_CONFIG: Env = schema.parse(Deno.env.toObject());
