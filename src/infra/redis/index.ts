import { createClient } from "redis";
import { APP_CONFIG } from "../../config/env.ts";

export const client = createClient({
  username: APP_CONFIG.REDIS_USER,
  password: APP_CONFIG.REDIS_PASSWORD,
  socket: {
    host: APP_CONFIG.REDIS_HOST,
    port: APP_CONFIG.REDIS_PORT,
  },
});

await client.connect();

client.on("error", (err) => console.error(err));