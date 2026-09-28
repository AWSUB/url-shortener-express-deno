import { randomUUID } from "node:crypto";
import { APP_CONFIG } from "../../config/env.ts";
import { httpError } from "../../utils/http-error.ts";
import { signAccessToken } from "../../utils/jwt.ts";
import { sendMail } from "../../utils/mailer.ts";
import { consumeOtp, issueOtp } from "../../utils/otp.ts";
import { hashPassword, verifyPassword } from "../../utils/password.ts";
import * as repository from "./repository.ts";

export const register = async (email: string, password: string) => {
  const existing = await repository.getUserByEmail(email);

  if (existing?.email_verified_at) {
    throw httpError("email already registered", 409);
  }

  if (!existing) {
    await repository.createUser(randomUUID(), email, await hashPassword(password));
  }

  const code = await issueOtp(email);

  const receipt = await sendMail({
    to: email,
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
  await consumeOtp(email, otp);

  const user = await repository.getUserByEmail(email);
  if (!user?.email_verified_at) {
    throw httpError("invalid or expired code", 400);
  }

  await repository.updateUser(user.id, { email_verified_at: new Date() });
};

export const login = async (email: string, password: string) => {
  const user = await repository.getUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw httpError("invalid email or password", 401);
  }

  if (user.email_verified_at === null) {
    throw httpError("email not verified yet", 401);
  }

  return signAccessToken(user.id);
};
