import { assertEquals } from "@std/assert";
import { withApp } from "../../helpers/app.ts";

Deno.test("GET /api/v1/health returns ok", () =>
  withApp(async (base) => {
    const res = await fetch(`${base}/api/v1/health`);
    assertEquals(res.status, 200);
    assertEquals(await res.json(), { message: "ok" });
  }),
);

Deno.test("unknown route falls through to not-found", () =>
  withApp(async (base) => {
    const res = await fetch(`${base}/api/v1/nope`);
    assertEquals(res.status, 404);
    assertEquals(await res.json(), { message: "not found" });
  }),
);
