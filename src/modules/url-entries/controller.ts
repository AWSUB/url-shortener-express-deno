import type { Request, Response } from "express";
import type { AppResponse } from "../../types/response.ts";
import { createUrlSchema, shortCodeParamSchema, urlIdParamSchema } from "./schema.ts";
import * as service from "./service.ts";
import type { URLEntry } from "./repository.ts";

export const create = async (req: Request, res: Response<AppResponse<URLEntry>>) => {
  const body = createUrlSchema.parse(req.body);

  const entry = await service.createUrl(
    req.userId!,
    body.original_url,
    body.custom_code,
    body.expires_at,
  );

  res.status(201).json({
    message: "short URL created",
    data: entry,
  });
};

export const redirect = async (
  req: Request,
  res: Response<AppResponse<{ originalUrl: string }>>,
) => {
  const { code } = shortCodeParamSchema.parse(req.params);

  const originalUrl = await service.redirect(code);

  res.json({
    message: "ok",
    data: { originalUrl },
  });
};

export const list = async (req: Request, res: Response<AppResponse<URLEntry[]>>) => {
  const entries = await service.listUrls(req.userId!);

  res.json({
    message: "ok",
    data: entries,
  });
};

export const get = async (req: Request, res: Response<AppResponse<URLEntry>>) => {
  const { id } = urlIdParamSchema.parse(req.params);

  const entry = await service.getUrl(id, req.userId!);

  res.json({
    message: "ok",
    data: entry,
  });
};

export const remove = async (req: Request, res: Response<AppResponse>) => {
  const { id } = urlIdParamSchema.parse(req.params);

  await service.deleteUrl(id, req.userId!);

  res.json({ message: "URL deleted" });
};
