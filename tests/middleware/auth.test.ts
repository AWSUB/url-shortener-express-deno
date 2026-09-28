import { assertEquals } from "@std/assert";
import express, { type Request, type Response } from "express";
import { auth } from "../../src/middleware/auth.ts";
import { errorHandler } from "../../src/middleware/error-handler.ts";
import { signAccessToken } from "../../src/utils/jwt.ts";
import { withApp } from "../helpers/app.ts";

Deno.test("auth middleware rejects missing authorization header with 401", async () => {
  let error: unknown = null;
  const req = { headers: {} } as Request;
  const res = { locals: {} } as Response;

  await auth(req, res, (err) => {
    error = err;
  });

  assertEquals((error as { status?: number })?.status, 401);
  assertEquals((error as Error)?.message, "missing or invalid authorization header");
});

Deno.test("auth middleware rejects non-Bearer authorization header with 401", async () => {
  let error: unknown = null;
  const req = { headers: { authorization: "Basic 12345" } } as Request;
  const res = { locals: {} } as Response;

  await auth(req, res, (err) => {
    error = err;
  });

  assertEquals((error as { status?: number })?.status, 401);
  assertEquals((error as Error)?.message, "missing or invalid authorization header");
});

Deno.test("auth middleware rejects empty Bearer token with 401", async () => {
  let error: unknown = null;
  const req = { headers: { authorization: "Bearer " } } as Request;
  const res = { locals: {} } as Response;

  await auth(req, res, (err) => {
    error = err;
  });

  assertEquals((error as { status?: number })?.status, 401);
  assertEquals((error as Error)?.message, "missing or invalid authorization header");
});

Deno.test("auth middleware rejects invalid token with 401", async () => {
  let error: unknown = null;
  const req = { headers: { authorization: "Bearer invalid.jwt.token" } } as Request;
  const res = { locals: {} } as Response;

  await auth(req, res, (err) => {
    error = err;
  });

  assertEquals((error as { status?: number })?.status, 401);
  assertEquals((error as Error)?.message, "invalid or expired token");
});

Deno.test("auth middleware accepts valid token and populates userId", async () => {
  const token = await signAccessToken("usr-12345");
  let calledNext = false;
  let nextErr: unknown = null;
  const req = { headers: { authorization: `Bearer ${token}` } } as Request;
  const res = { locals: {} } as unknown as Response;

  await auth(req, res, (err) => {
    calledNext = true;
    nextErr = err;
  });

  assertEquals(calledNext, true);
  assertEquals(nextErr, undefined);
  assertEquals(req.userId, "usr-12345");
});

Deno.test("auth middleware works within an Express route", async () => {
  const customApp = express();
  customApp.get("/protected", auth, (req, res) => {
    res.json({ userId: req.userId });
  });
  customApp.use(errorHandler);

  const server = customApp.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address() as { port: number };
  const base = `http://127.0.0.1:${port}`;

  try {
    // Without auth header
    const resNoAuth = await fetch(`${base}/protected`);
    assertEquals(resNoAuth.status, 401);

    // With valid token
    const token = await signAccessToken("usr-protected");
    const resAuth = await fetch(`${base}/protected`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assertEquals(resAuth.status, 200);
    const body = await resAuth.json();
    assertEquals(body.userId, "usr-protected");
  } finally {
    server.close();
  }
});
