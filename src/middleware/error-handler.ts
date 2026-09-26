import type { NextFunction, Request, Response } from "express";
import type { AppResponse } from "../types/response.ts";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<AppResponse>,
  _next: NextFunction,
) {
  console.error(err);
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({
    message: status >= 500 ? "internal server error" : err.message,
  });
}
