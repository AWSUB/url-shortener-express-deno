import { assertEquals, assertNotEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { hashPassword, verifyPassword } from "../../src/utils/password.ts";

Deno.test(
  "hashPassword encodes scrypt params, a 16-byte salt and a 64-byte key",
  async () => {
    const [algo, N, r, p, salt, key, ...rest] = (
      await hashPassword("secret123")
    ).split("$");

    assertEquals([algo, N, r, p], ["scrypt", "16384", "8", "1"]);
    assertEquals(rest, [], "hash must not contain extra $ segments");
    assertEquals(Buffer.from(salt, "base64").length, 16);
    assertEquals(Buffer.from(key, "base64").length, 64);
  },
);

Deno.test("hashPassword salts every hash differently", async () => {
  const [first, second] = await Promise.all([
    hashPassword("secret123"),
    hashPassword("secret123"),
  ]);

  assertNotEquals(first, second);
});

Deno.test(
  "verifyPassword accepts the password it was given and rejects others",
  async () => {
    const stored = await hashPassword("secret123");

    assertEquals(await verifyPassword("secret123", stored), true);
    assertEquals(await verifyPassword("wrong-password", stored), false);
  },
);

Deno.test("verifyPassword fails closed on a malformed hash", async () => {
  const malformed = [
    "",
    "not-a-hash",
    "bcrypt$16384$8$1$c2FsdA$a2V5",
    "scrypt$16384$8$1$c2FsdA",
    "scrypt$abc$8$1$c2FsdA$a2V5",
    "scrypt$16384$8$1$$a2V5",
  ];

  for (const stored of malformed) {
    assertEquals(
      await verifyPassword("secret123", stored),
      false,
      `expected false for ${JSON.stringify(stored)}`,
    );
  }
});
