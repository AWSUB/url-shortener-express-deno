import { randomBytes, randomUUID } from "node:crypto";
import { httpError } from "../../utils/http-error.ts";
import * as repository from "./repository.ts";

const generateShortCode = (): string =>
  randomBytes(4).toString("base64url").slice(0, 6);

export const createUrl = async (
  userId: string,
  originalUrl: string,
  customCode?: string,
  expiresAt?: string,
): Promise<repository.URLEntry> => {
  const short_code = customCode ?? generateShortCode();
  const expires_at = expiresAt ? new Date(expiresAt) : null;

  const existing = await repository.getUrlEntryByShortCode(short_code);
  if (existing) {
    throw httpError(
      customCode
        ? "short code already taken"
        : "short code collision, please try again",
      409,
    );
  }

  return repository.createUrlEntry(
    randomUUID(),
    userId,
    short_code,
    originalUrl,
    expires_at,
  );
};

export const redirect = async (shortCode: string): Promise<string> => {
  const entry = await repository.getUrlEntryByShortCode(shortCode);

  if (!entry) {
    throw httpError("short URL not found", 404);
  }

  if (entry.expires_at && entry.expires_at < new Date()) {
    throw httpError("short URL has expired", 410);
  }

  await repository.incrementClickCount(shortCode);

  return entry.original_url;
};

export const listUrls = async (userId: string): Promise<repository.URLEntry[]> => {
  return repository.listUrlEntries(userId);
};

export const getUrl = async (
  id: string,
  userId: string,
): Promise<repository.URLEntry> => {
  const entry = await repository.getUrlEntryById(id, userId);
  if (!entry) {
    throw httpError("URL not found", 404);
  }
  return entry;
};

export const deleteUrl = async (id: string, userId: string): Promise<void> => {
  const deleted = await repository.deleteUrlEntry(id, userId);
  if (!deleted) {
    throw httpError("URL not found", 404);
  }
};
