import { Pool } from "pg";
import { APP_CONFIG } from "../../config/env.ts";

export const pool = new Pool({
    host: APP_CONFIG.POSTGRES_HOST,
    port: APP_CONFIG.POSTGRES_PORT,
    database: APP_CONFIG.POSTGRES_DB,
    user: APP_CONFIG.POSTGRES_USER,
    password: APP_CONFIG.POSTGRES_PASSWORD
})