import { Request, Response } from "express";
import { AppResponse } from "../../types/response.ts";

export function health(_req: Request, res: Response<AppResponse>) {
    res.json({
        message: "ok"
    })
}