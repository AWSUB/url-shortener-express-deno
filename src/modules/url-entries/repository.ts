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
  user_id: string,
  short_code: string,
  original_url: string,
  expires_at: Date | null,
): Promise<URLEntry> => {
  const { rows } = await pool.query<URLEntry>(
    `
    INSERT INTO url_entries (id, user_id, short_code, original_url, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${COLS}
    `,
    [id, user_id, short_code, original_url, expires_at],
  );
  return rows[0];
};

export const getUrlEntryByShortCode = async (
  short_code: string,
): Promise<URLEntry | null> => {
  const { rows } = await pool.query<URLEntry>(
    `
    SELECT ${COLS} FROM url_entries
    WHERE short_code = $1
    `,
    [short_code],
  );
  return rows[0] ?? null;
};

export const getUrlEntryById = async (
  id: string,
  user_id: string,
): Promise<URLEntry | null> => {
  const { rows } = await pool.query<URLEntry>(
    `
    SELECT ${COLS} FROM url_entries
    WHERE id = $1 AND user_id = $2
    `,
    [id, user_id],
  );
  return rows[0] ?? null;
};

export const listUrlEntries = async (user_id: string): Promise<URLEntry[]> => {
  const { rows } = await pool.query<URLEntry>(
    `
    SELECT ${COLS} FROM url_entries
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [user_id],
  );
  return rows;
};

export const incrementClickCount = async (short_code: string): Promise<void> => {
  await pool.query(
    `
    UPDATE url_entries
    SET click_count = click_count + 1, updated_at = now()
    WHERE short_code = $1
    `,
    [short_code],
  );
};

export const deleteUrlEntry = async (
  id: string,
  user_id: string,
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `
    DELETE FROM url_entries
    WHERE id = $1 AND user_id = $2
    `,
    [id, user_id],
  );
  return (rowCount ?? 0) > 0;
};