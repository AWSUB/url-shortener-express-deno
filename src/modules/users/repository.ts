import { pool } from "../../infra/postgres/index.ts";

export interface User {
  id: string;
  email: string;
  email_verified_at: Date | null;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

const COLS =
  "id, email, email_verified_at, password_hash, created_at, updated_at, deleted_at";

export const createUser = async (
  id: string,
  email: string,
  password_hash: string,
): Promise<User> => {
  const { rows } = await pool.query<User>(
    `
    INSERT INTO users (id, email, password_hash) 
    VALUES ($1, $2, $3) 
    RETURNING ${COLS}
    `,
    [id, email, password_hash],
  );
  return rows[0];
};

export const getUser = async (id: string): Promise<User | null> => {
  const { rows } = await pool.query<User>(
    `
    SELECT ${COLS} FROM users WHERE
        id = $1 AND
        deleted_at IS NULL
    `,
    [id],
  );
  return rows[0] ?? null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { rows } = await pool.query<User>(
    `
    SELECT ${COLS} FROM users WHERE
        email = $1 AND
        deleted_at IS NULL
    `,
    [email],
  );
  return rows[0] ?? null;
};

export const listUsers = async (): Promise<User[]> => {
  const { rows } = await pool.query<User>(
    `
    SELECT ${COLS} FROM users WHERE 
        deleted_at IS NULL 
    ORDER BY created_at DESC
    `,
  );
  return rows;
};

export const updateUser = async (
  id: string,
  patch: Partial<
    Pick<User, "email" | "password_hash" | "email_verified_at">
  >,
): Promise<User | null> => {
  const fields: string[] = [];
  const values: unknown[] = [id];

  if (patch.email !== undefined) {
    values.push(patch.email);
    fields.push(`email = $${values.length}`);
  }

  if (patch.password_hash !== undefined) {
    values.push(patch.password_hash);
    fields.push(`password_hash = $${values.length}`);
  }

  if (patch.email_verified_at !== undefined) {
    values.push(patch.email_verified_at);
    fields.push(`email_verified_at = $${values.length}`);
  }

  if (fields.length === 0) {
    return getUser(id);
  }

  fields.push(`updated_at = now()`);

  const { rows } = await pool.query<User>(
    `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING ${COLS}
    `,
    values,
  );
  return rows[0] ?? null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { rowCount } = await pool.query(
    "UPDATE users SET deleted_at = now(), updated_at = now() WHERE id = $1 AND deleted_at IS NULL",
    [id],
  );
  return (rowCount ?? 0) > 0;
};
