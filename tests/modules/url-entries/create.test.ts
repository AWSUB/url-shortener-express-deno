import { assertEquals, assertRejects } from "@std/assert";
import { randomUUID } from "node:crypto";
import { pool } from "../../../src/infra/postgres/index.ts";
import * as userRepository from "../../../src/modules/users/repository.ts";
import * as urlService from "../../../src/modules/url-entries/service.ts";

const createTestUser = async () => {
  const id = randomUUID();
  const user = await userRepository.createUser(
    id,
    `url-test-${id}@example.com`,
    `test-hash-${id}`,
  );
  return user;
};

Deno.test("createUrl stores a generated short code", async () => {
  const user = await createTestUser();

  try {
    const entry = await urlService.createUrl(user.id, "https://example.com");

    assertEquals(/^[A-Za-z0-9_-]{6}$/.test(entry.short_code), true);
    assertEquals(entry.user_id, user.id);
    assertEquals(entry.original_url, "https://example.com");
  } finally {
    await pool.query("DELETE FROM users WHERE id = $1", [user.id]);
  }
});

Deno.test("createUrl rejects a duplicate custom code", async () => {
  const user = await createTestUser();

  try {
    await urlService.createUrl(
      user.id,
      "https://first.example.com",
      "same-code",
    );

    await assertRejects(
      () =>
        urlService.createUrl(
          user.id,
          "https://second.example.com",
          "same-code",
        ),
      Error,
      "short code already taken",
    );
  } finally {
    await pool.query("DELETE FROM users WHERE id = $1", [user.id]);
  }
});
