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

  JWT_ACCESS_SECRET: req,
  JWT_EXPIRATION: req,
});

export type Env = z.infer<typeof schema>;

export const APP_CONFIG: Env = schema.parse(Deno.env.toObject());
