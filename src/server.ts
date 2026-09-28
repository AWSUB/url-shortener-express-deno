import { app } from "./app.ts";
import { APP_CONFIG } from "./config/env.ts";
import { client } from "./infra/redis/index.ts";

const server = app.listen(APP_CONFIG.APP_PORT, APP_CONFIG.APP_HOST, () => {
  console.log(
    `${APP_CONFIG.APP_ENV} listening on http://${APP_CONFIG.APP_HOST}:${APP_CONFIG.APP_PORT}`,
  );
});

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  Deno.addSignalListener(sig, () => {
    server.close(async () => {
      await client.close();
      Deno.exit(0);
    });
  });
}
