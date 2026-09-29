-- migrate:up
ALTER TABLE users DROP CONSTRAINT users_password_hash_key;

-- migrate:down
ALTER TABLE users ADD CONSTRAINT users_password_hash_key UNIQUE (password_hash);
