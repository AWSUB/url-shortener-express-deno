import { APP_CONFIG } from "../config/env.ts";
import { client } from "../infra/redis/index.ts";

const cacheKey = (shortCode: string) => `short-url:${shortCode}`;

export const getCachedOriginalUrl = async (
  shortCode: string,
): Promise<string | null> => {
  try {
    return await client.get(cacheKey(shortCode));
  } catch (error) {
    console.error("Failed to read short URL cache", error);
    return null;
  }
};

export const cacheOriginalUrl = async (
  shortCode: string,
  originalUrl: string,
  expiresAt: Date | null,
): Promise<void> => {
  const ttl = expiresAt
    ? Math.min(
      APP_CONFIG.SHORT_URL_CACHE_TTL_SECONDS,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    )
    : APP_CONFIG.SHORT_URL_CACHE_TTL_SECONDS;

  if (ttl < 1) return;

  try {
    await client.set(cacheKey(shortCode), originalUrl, { EX: ttl });
  } catch (error) {
    console.error("Failed to write short URL cache", error);
  }
};

export const invalidateShortUrlCache = async (
  shortCode: string,
): Promise<void> => {
  try {
    await client.del(cacheKey(shortCode));
  } catch (error) {
    console.error("Failed to invalidate short URL cache", error);
  }
};
