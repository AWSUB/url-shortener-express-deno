import type { NextFunction, Request, Response } from "express";
import "../types/express.d.ts";
import { httpError } from "../utils/http-error.ts";
import { verifyAccessToken } from "../utils/jwt.ts";

export const auth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw httpError("missing or invalid authorization header", 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw httpError("missing or invalid authorization header", 401);
    }

    const payload = await verifyAccessToken(token);
    if (!payload.sub) {
      throw httpError("invalid or expired token", 401);
    }

    req.userId = payload.sub;

    next();
  } catch (err) {
    next(err);
  }
};
