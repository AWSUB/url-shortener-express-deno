import { randomUUID } from "node:crypto";
import { httpError } from "../../utils/http-error.ts";
import { generateShortCode } from "../../utils/short-code.ts";
import {
  cacheOriginalUrl,
  getCachedOriginalUrl,
  invalidateShortUrlCache,
} from "../../utils/short-url-cache.ts";
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

    const entry = await repository.createUrlEntry(
      randomUUID(),
      userId,
      shortCode,
      originalUrl,
      expiresAtDate,
    );

    await cacheOriginalUrl(
      entry.short_code,
      entry.original_url,
      entry.expires_at,
    );
    return entry;
  }

  throw httpError(
    "unable to generate a unique short code, please try again",
    503,
  );
};

export const redirect = async (shortCode: string): Promise<string> => {
  let originalUrl = await getCachedOriginalUrl(shortCode);

  if (originalUrl === null) {
    const entry = await repository.getUrlEntryByShortCode(shortCode);

    if (!entry) {
      throw httpError("short URL not found", 404);
    }

    if (entry.expires_at && entry.expires_at < new Date()) {
      throw httpError("short URL has expired", 410);
    }

    originalUrl = entry.original_url;
    await cacheOriginalUrl(
      entry.short_code,
      entry.original_url,
      entry.expires_at,
    );
  }

  await repository.incrementClickCount(shortCode);

  return originalUrl;
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
  const deletedShortCode = await repository.deleteUrlEntry(id, userId);
  if (!deletedShortCode) {
    throw httpError("URL not found", 404);
  }

  await invalidateShortUrlCache(deletedShortCode);
};
