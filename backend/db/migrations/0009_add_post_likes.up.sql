-- 0009_add_post_likes.up.sql
-- いいね履歴テーブルの追加

CREATE TABLE IF NOT EXISTS post_likes (
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 投稿IDでいいねを引くためのインデックス
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
-- ユーザーIDでいいね一覧を引くためのインデックス
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
