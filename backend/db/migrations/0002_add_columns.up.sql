-- 0002_add_columns.up.sql
-- add missing columns to match mock models

ALTER TABLE flavors ADD COLUMN IF NOT EXISTS color TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS icon_url TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS likes INT NOT NULL DEFAULT 0;
