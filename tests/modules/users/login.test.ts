import { assertEquals } from "@std/assert";
import { issuePaths, postJson, withApp } from "../../helpers/app.ts";

const login = (base: string, body: unknown) =>
  postJson(base, "/api/v1/users/login", body);

Deno.test("login reports both fields when the body is empty", () =>
  withApp(async (base) => {
    const res = await login(base, {});
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data).sort(), ["email", "password"]);
  }),
);

Deno.test("login rejects a malformed email", () =>
  withApp(async (base) => {
    const res = await login(base, { email: "nope", password: "secret123" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data), ["email"]);
  }),
);

Deno.test("login rejects a password shorter than 8 characters", () =>
  withApp(async (base) => {
    const res = await login(base, { email: "a@b.co", password: "short" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data), ["password"]);
  }),
);
