-- 0002_add_columns.down.sql
ALTER TABLE posts DROP COLUMN IF EXISTS likes;

ALTER TABLE users
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS icon_url,
  DROP COLUMN IF EXISTS external_url;

ALTER TABLE flavors DROP COLUMN IF EXISTS color;
