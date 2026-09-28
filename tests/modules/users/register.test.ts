import { assertEquals } from "@std/assert";
import { issuePaths, postJson, withApp } from "../../helpers/app.ts";
import { withCapturedLogs } from "../../helpers/logs.ts";

const register = (base: string, body: unknown) =>
  postJson(base, "/api/v1/users/register", body);

Deno.test("register rejects a body that is not an object", () =>
  withApp(async (base) => {
    const res = await register(base, [1, 2, 3]);
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(body.message, "validation failed");
  }),
);

Deno.test("malformed json is a logged 400, not a 500", () =>
  withApp(async (base) => {
    const [res, logged] = await withCapturedLogs(() =>
      fetch(`${base}/api/v1/users/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: '{"email": "a@b.co"',
      }),
    );
    assertEquals(res.status, 400);
    assertEquals(logged.length, 1);
  }),
);

Deno.test("register reports both fields when the body is empty", () =>
  withApp(async (base) => {
    const res = await register(base, {});
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data).sort(), ["email", "password"]);
  }),
);

Deno.test("register rejects a malformed email", () =>
  withApp(async (base) => {
    const res = await register(base, { email: "nope", password: "secret123" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(body.data, [
      { path: "email", message: "Invalid email address" },
    ]);
  }),
);

Deno.test("register rejects a password shorter than 8 characters", () =>
  withApp(async (base) => {
    const res = await register(base, { email: "a@b.co", password: "short" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data), ["password"]);
  }),
);

Deno.test("service.register creates unverified user and sets OTP in Redis", async () => {
  const email = `reg-success-${Date.now()}@example.com`;
  const mockTransport = {
    send: () => Promise.resolve({ successful: true as const, messageId: "msg-1" }),
  };

  const { register: registerService } = await import(
    "../../../src/modules/users/service.ts"
  );
  const { pool } = await import("../../../src/infra/postgres/index.ts");
  const { client } = await import("../../../src/infra/redis/index.ts");
  const repository = await import("../../../src/modules/users/repository.ts");

  await registerService(email, "password123", mockTransport);

  const user = await repository.getUserByEmail(email);
  assertEquals(user !== null, true);
  assertEquals(user?.email_verified_at, null);

  const rawOtp = await client.get(`email-otp:${email}`);
  assertEquals(rawOtp !== null, true);

  // Clean up
  await pool.query("DELETE FROM users WHERE id = $1", [user!.id]);
  await client.del(`email-otp:${email}`);
});

