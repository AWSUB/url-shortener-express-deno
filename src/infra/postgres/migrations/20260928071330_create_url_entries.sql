-- migrate:up
CREATE TABLE url_entries (
    id           UUID PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    short_code   VARCHAR(255) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    click_count  INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ
);

CREATE UNIQUE INDEX url_entries_user_id_short_code_idx ON url_entries (user_id, short_code);

-- migrate:down
DROP TABLE IF EXISTS url_entries;
