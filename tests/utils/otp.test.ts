import { assertEquals, assertRejects } from "@std/assert";
import { client } from "../../src/infra/redis/index.ts";
import { consumeOtp, issueOtp } from "../../src/utils/otp.ts";

const TEST_EMAIL = "test-otp@example.com";

Deno.test("issueOtp generates a 6-digit code and stores it in Redis", async () => {
  const code = await issueOtp(TEST_EMAIL);

  assertEquals(/^\d{6}$/.test(code), true);

  const raw = await client.get(`email-otp:${TEST_EMAIL}`);
  assertEquals(raw !== null, true);

  const entry = JSON.parse(raw!);
  assertEquals(entry.code, code);
  assertEquals(entry.attempts, 0);

  // Clean up
  await client.del(`email-otp:${TEST_EMAIL}`);
});

Deno.test("consumeOtp succeeds with the correct code and removes it from Redis", async () => {
  const code = await issueOtp(TEST_EMAIL);

  await consumeOtp(TEST_EMAIL, code);

  const raw = await client.get(`email-otp:${TEST_EMAIL}`);
  assertEquals(raw, null);
});

Deno.test("consumeOtp rejects incorrect code and increments attempts", async () => {
  const code = await issueOtp(TEST_EMAIL);
  const wrongCode = code === "000000" ? "111111" : "000000";

  await assertRejects(
    () => consumeOtp(TEST_EMAIL, wrongCode),
    Error,
    "invalid or expired code",
  );

  const raw = await client.get(`email-otp:${TEST_EMAIL}`);
  assertEquals(raw !== null, true);
  const entry = JSON.parse(raw!);
  assertEquals(entry.attempts, 1);

  // Clean up
  await client.del(`email-otp:${TEST_EMAIL}`);
});

Deno.test("consumeOtp rejects expired or missing code", async () => {
  await assertRejects(
    () => consumeOtp("nonexistent@example.com", "123456"),
    Error,
    "invalid or expired code",
  );
});
