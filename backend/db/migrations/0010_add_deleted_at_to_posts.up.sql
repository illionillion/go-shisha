-- 0010_add_deleted_at_to_posts.up.sql
-- 投稿の論理削除用 deleted_at カラムを追加する

ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMPTZ;

-- 論理削除済み投稿を除外する検索の効率化のためインデックスを追加
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at) WHERE deleted_at IS NULL;
