import type { NextFunction, Request, Response } from "express";
import type { AppResponse } from "../types/response.ts";

export function notFound(
  _req: Request,
  res: Response<AppResponse>,
  _next: NextFunction,
) {
  res.status(404).json({ message: "not found" });
}
