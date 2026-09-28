import { assertEquals } from "@std/assert";
import { issuePaths, postJson, withApp } from "../../helpers/app.ts";

const verify = (base: string, body: unknown) =>
  postJson(base, "/api/v1/users/verify", body);

Deno.test("verify reports both fields when the body is empty", () =>
  withApp(async (base) => {
    const res = await verify(base, {});
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data).sort(), ["email", "otp"]);
  }));

Deno.test("verify rejects an otp that is not six digits", () =>
  withApp(async (base) => {
    const res = await verify(base, { email: "a@b.co", otp: "abcdef" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data), ["otp"]);
  }));

Deno.test("verify rejects a malformed email alongside a valid otp", () =>
  withApp(async (base) => {
    const res = await verify(base, { email: "nope", otp: "123456" });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(issuePaths(body.data), ["email"]);
  }));
