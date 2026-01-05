-- 0002_add_columns.down.sql
-- DOWN: アップマイグレーション(0002_add_columns.up.sql) の逆順でカラムを削除します
-- UP では flavors -> users -> posts の順でカラムを追加しているため、
-- DOWN では posts -> users -> flavors の順で削除します。

ALTER TABLE posts DROP COLUMN IF EXISTS likes;

ALTER TABLE users
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS icon_url,
  DROP COLUMN IF EXISTS external_url;

ALTER TABLE flavors DROP COLUMN IF EXISTS color;
