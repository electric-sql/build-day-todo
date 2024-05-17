-- Add `task`, `done` and `created_at` columns to the `items` table.
ALTER TABLE items ADD COLUMN task TEXT;
ALTER TABLE items ADD COLUMN done BOOLEAN;
ALTER TABLE items ADD COLUMN created_at TIMESTAMP;
