import { randomBytes } from "node:crypto";

export const generateShortCode = (): string =>
  randomBytes(4).toString("base64url").slice(0, 6);
