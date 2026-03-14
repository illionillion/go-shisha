-- 0010_add_deleted_at_to_posts.down.sql
-- deleted_at カラムを削除する

DROP INDEX IF EXISTS idx_posts_not_deleted_created_at;
DROP INDEX IF EXISTS idx_posts_not_deleted_user_id_created_at;
ALTER TABLE posts DROP COLUMN IF EXISTS deleted_at;
