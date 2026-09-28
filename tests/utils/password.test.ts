import { assertEquals, assertNotEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { hashPassword } from "../../src/utils/password.ts";

Deno.test("hashPassword encodes scrypt params, a 16-byte salt and a 64-byte key", async () => {
  const [algo, N, r, p, salt, key, ...rest] = (await hashPassword("secret123"))
    .split("$");

  assertEquals([algo, N, r, p], ["scrypt", "16384", "8", "1"]);
  assertEquals(rest, [], "hash must not contain extra $ segments");
  assertEquals(Buffer.from(salt, "base64").length, 16);
  assertEquals(Buffer.from(key, "base64").length, 64);
});

Deno.test("hashPassword salts every hash differently", async () => {
  const [first, second] = await Promise.all([
    hashPassword("secret123"),
    hashPassword("secret123"),
  ]);

  assertNotEquals(first, second);
});
