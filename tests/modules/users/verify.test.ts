import { assertEquals } from "@std/assert";
import { randomUUID } from "node:crypto";
import { pool } from "../../../src/infra/postgres/index.ts";
import { client } from "../../../src/infra/redis/index.ts";
import * as repository from "../../../src/modules/users/repository.ts";
import { issueOtp } from "../../../src/utils/otp.ts";
import { hashPassword } from "../../../src/utils/password.ts";
import { issuePaths, postJson, withApp } from "../../helpers/app.ts";

const verify = (base: string, body: unknown) =>
  postJson(base, "/api/v1/users/verify", body);

Deno.test("verify reports both fields when the body is empty", () =>
  withApp(async (base) => {
    const res = await verify(base, {});
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data).sort(), ["email", "otp"]);
  }),
);

Deno.test("verify rejects an otp that is not six digits", () =>
  withApp(async (base) => {
    const res = await verify(base, { email: "a@b.co", otp: "abcdef" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data), ["otp"]);
  }),
);

Deno.test("verify rejects a malformed email alongside a valid otp", () =>
  withApp(async (base) => {
    const res = await verify(base, { email: "nope", otp: "123456" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data), ["email"]);
  }),
);

Deno.test("verify successfully marks user verified and consumes otp", () =>
  withApp(async (base) => {
    const email = `verify-success-${Date.now()}@example.com`;
    const user = await repository.createUser(
      randomUUID(),
      email,
      await hashPassword("password123"),
    );
    const otp = await issueOtp(email);

    const res = await verify(base, { email, otp });
    const body = await res.json();
    assertEquals(res.status, 200);
    assertEquals(body.message, "email verified");

    const updated = await repository.getUser(user.id);
    assertEquals(updated?.email_verified_at !== null, true);

    // OTP should be deleted from redis
    const redisVal = await client.get(`email-otp:${email}`);
    assertEquals(redisVal, null);

    // Clean up
    await pool.query("DELETE FROM users WHERE id = $1", [user.id]);
  }),
);

Deno.test("verify rejects already-verified user", () =>
  withApp(async (base) => {
    const email = `already-verified-${Date.now()}@example.com`;
    const user = await repository.createUser(
      randomUUID(),
      email,
      await hashPassword("password123"),
    );
    await repository.updateUser(user.id, { email_verified_at: new Date() });
    const otp = await issueOtp(email);

    const res = await verify(base, { email, otp });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(body.message, "email already verified");

    // Clean up
    await pool.query("DELETE FROM users WHERE id = $1", [user.id]);
    await client.del(`email-otp:${email}`);
  }),
);

