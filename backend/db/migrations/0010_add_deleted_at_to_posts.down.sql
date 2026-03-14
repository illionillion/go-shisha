-- 0010_add_deleted_at_to_posts.down.sql
-- deleted_at カラムを削除する

DROP INDEX IF EXISTS idx_posts_deleted_at;
ALTER TABLE posts DROP COLUMN IF EXISTS deleted_at;
