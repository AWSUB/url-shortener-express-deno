import { Pool } from "pg";
import { APP_CONFIG } from "../../config/env.ts";

const pool = new Pool({
    host: APP_CONFIG.POSTGRES_HOST,
    port: APP_CONFIG.POSTGRES_PORT,
    database: APP_CONFIG.POSTGRES_DB,
    user: APP_CONFIG.POSTGRES_USER,
    password: APP_CONFIG.POSTGRES_PASSWORD
})

export const query = (sql: string, params?: unknown[]) => {
    return pool.query(sql, params)
}

export const getClient = () => {
    return pool.connect()
}