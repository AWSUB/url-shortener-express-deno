import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { AppResponse } from "../types/response.ts";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response<AppResponse>,
  _next: NextFunction,
) => {
  if (err instanceof ZodError)
    return res.status(400).json({
      message: "validation failed",
      data: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });

  console.error(err);
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({
    message: status >= 500 ? "internal server error" : err.message,
  });
};
