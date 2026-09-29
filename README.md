# URL Shortener

A small URL shortener built to learn **Deno** and **Express 5**, with PostgreSQL and Redis.

## Run locally

You need Deno, Docker Compose, and the `dbmate` CLI installed.

1. Copy `.env.example` to `.env` and fill in the required settings. For local development, use `localhost` for the PostgreSQL and Redis hosts.
2. Start the data services:

   ```sh
   docker compose up -d postgres redis
   ```

3. Copy `.env.dbmate.example` to `.env.dbmate` and set `DATABASE_URL` to match your PostgreSQL settings in `.env`.
4. Create the database tables and start the app:

   ```sh
   deno task db:up
   deno task dev
   ```

The API runs at `http://localhost:3000/api`. OpenAPI documentation is in [`docs/openapi.yaml`](docs/openapi.yaml).
