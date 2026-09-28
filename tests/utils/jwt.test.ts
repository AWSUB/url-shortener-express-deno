import { assertEquals, assertRejects } from "@std/assert";
import { signAccessToken, verifyAccessToken } from "../../src/utils/jwt.ts";

Deno.test("a signed token round-trips its subject and expiry", async () => {
  const payload = await verifyAccessToken(await signAccessToken("user-123"));

  assertEquals(payload.sub, "user-123");
  assertEquals(typeof payload.exp, "number");
});

Deno.test("a garbage token is rejected with a 401", async () => {
  const err = await assertRejects(
    () => verifyAccessToken("not-a-jwt"),
    Error,
    "invalid or expired token",
  );

  assertEquals((err as { status?: number }).status, 401);
});
