import type { Request, Response } from "express";
import type { AppResponse } from "../../types/response.ts";
import { registerSchema, verifySchema } from "./schema.ts";
import * as service from "./service.ts";

export const register = async (req: Request, res: Response<AppResponse>) => {
  const body = registerSchema.parse(req.body);

  await service.register(body.email, body.password);
  res.status(201).json({ message: "verification code sent" });
};

export const verify = async (req: Request, res: Response<AppResponse>) => {
  const body = verifySchema.parse(req.body);

  await service.verify(body.email, body.otp);
  res.json({ message: "email verified" });
};
