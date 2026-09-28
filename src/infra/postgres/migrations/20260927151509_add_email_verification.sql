-- migrate:up
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ;
ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(255);

-- migrate:down
ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(72);
ALTER TABLE users DROP COLUMN email_verified_at;
