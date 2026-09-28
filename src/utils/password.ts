import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const PARAMS = { N: 16384, r: 8, p: 1 };

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${
    salt.toString("base64")
  }$${key.toString("base64")}`;
};

export const verifyPassword = async (
  password: string,
  stored: string,
): Promise<boolean> => {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const params = {
    N: Number(parts[1]),
    r: Number(parts[2]),
    p: Number(parts[3]),
  };
  if (!Object.values(params).every(Number.isInteger)) return false;

  const saltBytes = Buffer.from(parts[4], "base64");
  const keyBytes = Buffer.from(parts[5], "base64");
  if (saltBytes.length === 0 || keyBytes.length === 0) return false;

  const derived = await scryptAsync(
    password,
    saltBytes,
    keyBytes.length,
    params,
  );
  return timingSafeEqual(derived, keyBytes);
};
