-- 0004_add_slides_table.down.sql
-- スライドテーブルを削除し、postsテーブルを元の構造に戻す

-- postsテーブルに削除したカラムを復元
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS flavor_id BIGINT REFERENCES flavors(id);

-- インデックスを復元
CREATE INDEX IF NOT EXISTS idx_posts_flavor_id ON posts(flavor_id);

-- slidesテーブルのデータをpostsに戻す（最初のslideのみ）
UPDATE posts p
SET 
  image_url = s.image_url,
  content = s.text,
  flavor_id = s.flavor_id
FROM (
  SELECT DISTINCT ON (post_id) *
  FROM slides
  ORDER BY post_id, slide_order
) s
WHERE p.id = s.post_id;

-- slidesテーブルを削除
DROP TABLE IF EXISTS slides;
