-- 0004_add_slides_table.up.sql
-- Post内に複数のSlide（画像+テキスト+フレーバー）を持てるようにテーブル追加

-- スライドテーブルを作成
CREATE TABLE IF NOT EXISTS slides (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  text TEXT,
  flavor_id BIGINT REFERENCES flavors(id),
  slide_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_slides_post_id ON slides(post_id);
CREATE INDEX IF NOT EXISTS idx_slides_flavor_id ON slides(flavor_id);

-- postsテーブルからimage_url, flavor_id, contentカラムを削除
-- （既存データがある場合は先にslidesテーブルへ移行が必要）
-- 既存のpostsデータをslidesへ移行
-- - image_url が NULL の投稿でも、content または flavor_id が存在する場合は
--   スライドを作成します（image_url は空文字に変換して挿入）。
-- - 完全に空の投稿（image_url, content, flavor_id 全て NULL）の場合はスキップします。
INSERT INTO slides (post_id, image_url, text, flavor_id, slide_order)
SELECT id, COALESCE(image_url, ''), content, flavor_id, 0
FROM posts
WHERE image_url IS NOT NULL OR content IS NOT NULL OR flavor_id IS NOT NULL;

-- 移行後にpostsテーブルから不要なカラムを削除
ALTER TABLE posts DROP COLUMN IF EXISTS image_url;
ALTER TABLE posts DROP COLUMN IF EXISTS flavor_id;
ALTER TABLE posts DROP COLUMN IF EXISTS content;
