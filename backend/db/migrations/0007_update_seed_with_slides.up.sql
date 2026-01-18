-- 0005_update_seed_with_slides.up.sql
-- 複数スライド対応のシードデータ更新

-- 既存のpostデータを削除（slidesも CASCADE で削除される）
DELETE FROM posts;

-- postsを再作成（スライドは別テーブルなのでここではlikesとuser_idのみ）
INSERT INTO posts (id, user_id, likes, created_at) VALUES
  (1, 1, 12, NOW()),
  (2, 2, 8, NOW()),
  (3, 1, 22, NOW()),
  (4, 2, 15, NOW()),
  (5, 1, 18, NOW()),
  (6, 2, 25, NOW())
ON CONFLICT (id) DO NOTHING;

-- slides データを挿入（元のモックデータを復元）
-- flavor mapping: 1=ミント, 2=アップル, 3=ベリー, 4=マンゴー, 5=オレンジ, 6=グレープ

-- Post 1: 3つのスライド (flavor_id: 1=ミント, 2=アップル, 3=ベリー)
INSERT INTO slides (post_id, image_url, text, flavor_id, slide_order) VALUES
  (1, '/images/264971_0.jpg', '最初はミント。爽やかでスッキリ！', 1, 0),
  (1, '/images/264972_0.jpg', '次はダブルアップル。甘さが絶妙', 2, 1),
  (1, '/images/264973_0.jpg', '最後はベリー。締めにぴったり', 3, 2);

-- Post 2: 2つのスライド (flavor_id: 6=グレープ, 5=オレンジ)
INSERT INTO slides (post_id, image_url, text, flavor_id, slide_order) VALUES
  (2, '/images/264974_0.jpg', 'グレープの濃厚な香り', 6, 0),
  (2, '/images/264975_0.jpg', 'オレンジでリフレッシュ', 5, 1);

-- Post 3: 1つのスライド (flavor_id: 3=ベリー)
INSERT INTO slides (post_id, image_url, text, flavor_id, slide_order) VALUES
  (3, '/images/264977_0.jpg', 'ベリー単体で味わい深い', 3, 0);

-- Post 4: 2つのスライド (flavor_id: 4=マンゴー, 1=ミント)
INSERT INTO slides (post_id, image_url, text, flavor_id, slide_order) VALUES
  (4, '/images/264978_0.jpg', 'マンゴーで夏気分', 4, 0),
  (4, '/images/264979_0.jpg', 'ミントでクールダウン', 1, 1);

-- Post 5: 1つのスライド (flavor_id: 5=オレンジ)
INSERT INTO slides (post_id, image_url, text, flavor_id, slide_order) VALUES
  (5, '/images/264975_0.jpg', 'オレンジで元気チャージ', 5, 0);

-- Post 6: 2つのスライド (flavor_id: 6=グレープ, 3=ベリー)
INSERT INTO slides (post_id, image_url, text, flavor_id, slide_order) VALUES
  (6, '/images/264976_0.jpg', 'グレープで濃厚な一服', 6, 0),
  (6, '/images/264977_0.jpg', 'ベリーでさっぱり', 3, 1);

-- シーケンス同期
SELECT setval(pg_get_serial_sequence('posts','id'), COALESCE((SELECT MAX(id) FROM posts), 1), true);
SELECT setval(pg_get_serial_sequence('slides','id'), COALESCE((SELECT MAX(id) FROM slides), 1), true);
