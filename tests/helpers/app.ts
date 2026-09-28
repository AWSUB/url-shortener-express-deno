import type { AddressInfo } from "node:net";
import { app } from "../../src/app.ts";

export const withApp = async (run: (base: string) => Promise<void>) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
};

export const postJson = (base: string, path: string, body: unknown) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export const issuePaths = (data: unknown): string[] =>
  (data as Array<{ path: string }>).map((issue) => issue.path);
