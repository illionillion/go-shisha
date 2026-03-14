-- 0010_add_deleted_at_to_posts.up.sql
-- 投稿の論理削除用 deleted_at カラムを追加する

ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMPTZ;

-- GetAll: deleted_at IS NULL + ORDER BY created_at DESC 用インデックス
CREATE INDEX IF NOT EXISTS idx_posts_not_deleted_created_at ON posts(created_at DESC) WHERE deleted_at IS NULL;
-- GetByUserID: deleted_at IS NULL + WHERE user_id + ORDER BY created_at DESC 用インデックス
CREATE INDEX IF NOT EXISTS idx_posts_not_deleted_user_id_created_at ON posts(user_id, created_at DESC) WHERE deleted_at IS NULL;
