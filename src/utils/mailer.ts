import {
  createMessage,
  type MessageConstructor,
  type Receipt,
  type Transport,
} from "@upyo/core";
import { SmtpTransport } from "@upyo/smtp";
import { APP_CONFIG } from "../config/env.ts";

export const smtpTransport = new SmtpTransport({
  host: APP_CONFIG.SMTP_HOST,
  port: APP_CONFIG.SMTP_PORT,
  auth: APP_CONFIG.SMTP_AUTH
    ? { user: APP_CONFIG.SMTP_USER, pass: APP_CONFIG.SMTP_PASS }
    : undefined,
});

export type MailInput = Omit<MessageConstructor, "from"> & {
  from?: MessageConstructor["from"];
};

export const sendMail = (
  mail: MailInput,
  transport: Pick<Transport, "send"> = smtpTransport,
): Promise<Receipt> =>
  transport.send(
    createMessage({ ...mail, from: mail.from ?? APP_CONFIG.MAIL_FROM }),
  );
