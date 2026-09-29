import { pool } from "../../infra/postgres/index.ts";

export interface URLEntry {
  id: string;
  user_id: string;
  short_code: string;
  original_url: string;
  click_count: number;
  created_at: Date;
  updated_at: Date;
  expires_at: Date | null;
}

const COLS =
  "id, user_id, short_code, original_url, click_count, created_at, updated_at, expires_at";

export const createUrlEntry = async (
  id: string,
  userId: string,
  shortCode: string,
  originalUrl: string,
  expiresAt: Date | null,
): Promise<URLEntry> => {
  const { rows } = await pool.query<URLEntry>(
    `
    INSERT INTO url_entries (id, user_id, short_code, original_url, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${COLS}
    `,
    [id, userId, shortCode, originalUrl, expiresAt],
  );
  return rows[0];
};

export const getUrlEntryByShortCode = async (
  shortCode: string,
): Promise<URLEntry | null> => {
  const { rows } = await pool.query<URLEntry>(
    `
    SELECT ${COLS} FROM url_entries
    WHERE short_code = $1
    `,
    [shortCode],
  );
  return rows[0] ?? null;
};

export const getUrlEntryById = async (
  id: string,
  userId: string,
): Promise<URLEntry | null> => {
  const { rows } = await pool.query<URLEntry>(
    `
    SELECT ${COLS} FROM url_entries
    WHERE id = $1 AND user_id = $2
    `,
    [id, userId],
  );
  return rows[0] ?? null;
};

export const listUrlEntries = async (userId: string): Promise<URLEntry[]> => {
  const { rows } = await pool.query<URLEntry>(
    `
    SELECT ${COLS} FROM url_entries
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId],
  );
  return rows;
};

export const incrementClickCount = async (
  shortCode: string,
): Promise<void> => {
  await pool.query(
    `
    UPDATE url_entries
    SET click_count = click_count + 1, updated_at = now()
    WHERE short_code = $1
    `,
    [shortCode],
  );
};

export const deleteUrlEntry = async (
  id: string,
  userId: string,
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `
    DELETE FROM url_entries
    WHERE id = $1 AND user_id = $2
    `,
    [id, userId],
  );
  return (rowCount ?? 0) > 0;
};
