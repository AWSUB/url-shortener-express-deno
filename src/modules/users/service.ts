import { randomUUID } from "node:crypto";
import type { Transport } from "@upyo/core";
import { APP_CONFIG } from "../../config/env.ts";
import { httpError } from "../../utils/http-error.ts";
import { signAccessToken } from "../../utils/jwt.ts";
import { sendMail, smtpTransport } from "../../utils/mailer.ts";
import { consumeOtp, discardOtp, issueOtp } from "../../utils/otp.ts";
import { hashPassword, verifyPassword } from "../../utils/password.ts";
import * as repository from "./repository.ts";

export const register = async (
  email: string,
  password: string,
  mailTransport: Pick<Transport, "send"> = smtpTransport,
) => {
  const address = email.toLowerCase();
  const existing = await repository.getUserByEmail(address);

  if (existing?.deleted_at || existing?.email_verified_at) {
    throw httpError("email already registered", 409);
  }

  if (!existing) {
    await repository.createUser(
      randomUUID(),
      address,
      await hashPassword(password),
    );
  }

  try {
    const code = await issueOtp(address);
    const receipt = await sendMail(
      {
        to: address,
        subject: "Verify your email",
        content: {
          text: `Your verification code is ${code}. It expires in ${
            APP_CONFIG.OTP_TTL_SECONDS / 60
          } minutes.`,
        },
      },
      mailTransport,
    );

    if (!receipt.successful) {
      throw httpError("failed to send verification email", 502);
    }
  } catch (error) {
    await Promise.allSettled([discardOtp(address)]);
    throw error;
  }
};

export const verify = async (email: string, otp: string) => {
  const address = email.toLowerCase();
  const user = await repository.getUserByEmail(address);

  if (!user || user.deleted_at) {
    throw httpError("user not found", 404);
  }

  if (user.email_verified_at) {
    throw httpError("email already verified", 400);
  }

  await consumeOtp(address, otp);

  await repository.updateUser(user.id, { email_verified_at: new Date() });
};

export const login = async (email: string, password: string) => {
  const address = email.toLowerCase();
  const user = await repository.getUserByEmail(address);

  if (
    !user || user.deleted_at ||
    !(await verifyPassword(password, user.password_hash))
  ) {
    throw httpError("invalid email or password", 401);
  }

  if (user.email_verified_at === null) {
    throw httpError("email not verified yet", 401);
  }

  return signAccessToken(user.id);
};
