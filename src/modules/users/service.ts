import { randomUUID } from "node:crypto";
import { APP_CONFIG } from "../../config/env.ts";
import { httpError } from "../../utils/http-error.ts";
import { sendMail } from "../../utils/mailer.ts";
import { consumeOtp, issueOtp } from "../../utils/otp.ts";
import { hashPassword } from "../../utils/password.ts";
import * as repository from "./repository.ts";

export const register = async (email: string, password: string) => {
  const address = email.toLowerCase();
  const existing = await repository.getUserByEmail(address);

  if (existing?.email_verified_at) {
    throw httpError("email already registered", 409);
  }

  if (!existing) {
    await repository.createUser(randomUUID(), address, await hashPassword(password));
  }

  const code = await issueOtp(address);

  const receipt = await sendMail({
    to: address,
    subject: "Verify your email",
    content: {
      text: `Your verification code is ${code}. It expires in ${APP_CONFIG.OTP_TTL_SECONDS / 60} minutes.`,
    },
  });

  if (!receipt.successful) {
    throw httpError("failed to send verification email", 502);
  }
};

export const verify = async (email: string, otp: string) => {
  const address = email.toLowerCase();
  await consumeOtp(address, otp);

  const user = await repository.getUserByEmail(address);
  if (!user?.email_verified_at) {
    throw httpError("invalid or expired code", 400);
  }

  await repository.updateUser(user.id, { email_verified_at: new Date() });
};
