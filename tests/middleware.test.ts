import type { NextFunction, Request, Response } from "express";
import { errorHandler } from "../src/middleware/error-handler.ts";
import { notFound } from "../src/middleware/not-found.ts";
import type { AppResponse } from "../src/types/response.ts";

const req = {} as Request;
const next = (() => {}) as NextFunction;

function stubRes() {
  const out: { status: number; body?: AppResponse } = { status: 200 };
  const res = {
    status(n: number) {
      out.status = n;
      return this;
    },
    json(b: AppResponse) {
      out.body = b;
      return this;
    },
  };
  return { res: res as unknown as Response<AppResponse>, out };
}

function fail(actual: unknown, expected: unknown, what: string): never {
  throw new Error(
    `${what}: expected ${JSON.stringify(expected)}, got ${
      JSON.stringify(actual)
    }`,
  );
}

Deno.test("express only sees a handler with arity 4 (errors) or 3 (middleware)", () => {
  if (errorHandler.length !== 4) {
    fail(errorHandler.length, 4, "errorHandler.length");
  }
  if (notFound.length !== 3) fail(notFound.length, 3, "notFound.length");
});

Deno.test("notFound returns 404 with the envelope", () => {
  const { res, out } = stubRes();
  notFound(req, res, next);
  if (out.status !== 404) fail(out.status, 404, "status");
  if (out.body?.message !== "not found") {
    fail(out.body?.message, "not found", "message");
  }
});

Deno.test("errorHandler gives a 500 the generic message, never the cause", () => {
  const { res, out } = stubRes();
  errorHandler(
    new Error("connect ECONNREFUSED password=hunter2"),
    req,
    res,
    next,
  );
  if (out.status !== 500) fail(out.status, 500, "status");
  if (out.body?.message !== "internal server error") {
    fail(out.body?.message, "internal server error", "message");
  }
  if (JSON.stringify(out.body).includes("hunter2")) {
    throw new Error("leaked the cause into the body");
  }
});

Deno.test("errorHandler honours a status the thrower attached", () => {
  const { res, out } = stubRes();
  errorHandler(
    Object.assign(new Error("bad payload"), { status: 400 }),
    req,
    res,
    next,
  );
  if (out.status !== 400) fail(out.status, 400, "status");
  if (out.body?.message !== "bad payload") {
    fail(out.body?.message, "bad payload", "message");
  }
});
