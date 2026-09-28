import { jwtVerify, SignJWT } from "jose";
import { APP_CONFIG } from "../config/env.ts";
import { httpError } from "./http-error.ts";

const SECRET = new TextEncoder().encode(APP_CONFIG.JWT_ACCESS_SECRET);

export const signAccessToken = (sub: string): Promise<string> =>
  new SignJWT({ sub })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(APP_CONFIG.JWT_EXPIRATION)
    .sign(SECRET);

export const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    throw httpError("invalid or expired token", 401);
  }
};
