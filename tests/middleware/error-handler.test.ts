import type { Request, Response } from "express";
import { assertEquals } from "@std/assert";
import { z } from "zod";
import { errorHandler } from "../../src/middleware/error-handler.ts";
import type { AppResponse } from "../../src/types/response.ts";
import { httpError } from "../../src/utils/http-error.ts";
import { withCapturedLogs } from "../helpers/logs.ts";

const call = (err: Error) => {
  const captured: { code?: number; body?: AppResponse } = {};
  const res = {
    status(code: number) {
      captured.code = code;
      return res;
    },
    json(payload: AppResponse) {
      captured.body = payload;
      return res;
    },
  };
  errorHandler(
    err,
    {} as Request,
    res as unknown as Response<AppResponse>,
    () => {},
  );
  return captured;
};

Deno.test("a zod error becomes a 400 with dotted paths and is not logged", async () => {
  const parsed = z
    .object({ user: z.object({ email: z.email() }) })
    .safeParse({ user: {} });
  if (parsed.success) throw new Error("fixture was supposed to fail");

  const [res, logged] = await withCapturedLogs(() => call(parsed.error));
  const issues = res.body?.data as Array<{ path: string; message: string }>;

  assertEquals(res.code, 400);
  assertEquals(res.body?.message, "validation failed");
  assertEquals(
    issues.map((issue) => issue.path),
    ["user.email"],
  );
  assertEquals(issues.every((issue) => issue.message.length > 0), true);
  assertEquals(logged.length, 0);
});

Deno.test("an httpError keeps its status and message", async () => {
  const [res, logged] = await withCapturedLogs(() =>
    call(httpError("email already registered", 409))
  );

  assertEquals(res.code, 409);
  assertEquals(res.body?.message, "email already registered");
  assertEquals(logged.length, 1);
});

Deno.test("any other error is a logged 500", async () => {
  const err = new Error("boom");
  const [res, logged] = await withCapturedLogs(() => call(err));

  assertEquals(res.code, 500);
  assertEquals(res.body?.message, "internal server error");
  assertEquals(logged, [err]);
});
