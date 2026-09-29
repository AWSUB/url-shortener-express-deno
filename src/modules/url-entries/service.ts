import { randomUUID } from "node:crypto";
import { httpError } from "../../utils/http-error.ts";
import { generateShortCode } from "../../utils/short-code.ts";
import * as repository from "./repository.ts";

export const createUrl = async (
  userId: string,
  originalUrl: string,
  customCode?: string,
  expiresAt?: string,
): Promise<repository.URLEntry> => {
  const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

  const maxAttempts = customCode ? 1 : 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shortCode = customCode ?? generateShortCode();
    const existing = await repository.getUrlEntryByShortCode(shortCode);
    if (existing) {
      if (customCode) throw httpError("short code already taken", 409);
      continue;
    }

    return repository.createUrlEntry(
      randomUUID(),
      userId,
      shortCode,
      originalUrl,
      expiresAtDate,
    );
  }

  throw httpError(
    "unable to generate a unique short code, please try again",
    503,
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

export const listUrls = async (
  userId: string,
): Promise<repository.URLEntry[]> => {
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
