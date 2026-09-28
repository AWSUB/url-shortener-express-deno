import { randomInt } from "node:crypto";
import { APP_CONFIG } from "../config/env.ts";
import { client } from "../infra/redis/index.ts";
import { httpError } from "./http-error.ts";

interface OtpEntry {
  code: string;
  attempts: number;
}

const otpKey = (email: string) => `email-otp:${email}`;

export const issueOtp = async (email: string): Promise<string> => {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await client.set(otpKey(email), JSON.stringify({ code, attempts: 0 }), {
    EX: APP_CONFIG.OTP_TTL_SECONDS,
  });
  return code;
};

export const consumeOtp = async (
  email: string,
  code: string,
): Promise<void> => {
  const raw = await client.get(otpKey(email));
  if (!raw) throw httpError("invalid or expired code", 400);

  const entry = JSON.parse(raw) as OtpEntry;

  if (entry.attempts >= APP_CONFIG.OTP_MAX_ATTEMPTS) {
    await client.del(otpKey(email));
    throw httpError("too many attempts, request a new code", 400);
  }

  if (entry.code !== code) {
    entry.attempts += 1;
    await client.set(otpKey(email), JSON.stringify(entry), {
      EX: APP_CONFIG.OTP_TTL_SECONDS,
    });
    throw httpError("invalid or expired code", 400);
  }

  await client.del(otpKey(email));
};
