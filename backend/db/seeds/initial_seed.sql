-- initial_seed.sql
-- insert flavors
INSERT INTO flavors (id, name, created_at, color) VALUES
  (1, 'ミント', NOW(), 'bg-green-500'),
  (2, 'アップル', NOW(), 'bg-red-500'),
  (3, 'ベリー', NOW(), 'bg-purple-500'),
  (4, 'マンゴー', NOW(), 'bg-yellow-500'),
  (5, 'オレンジ', NOW(), 'bg-orange-500'),
  (6, 'グレープ', NOW(), 'bg-indigo-500')
ON CONFLICT (id) DO NOTHING;

-- insert users
INSERT INTO users (id, email, password_hash, display_name, description, icon_url, external_url, created_at) VALUES
  (1, 'test@example.com', '', 'テストユーザー', 'シーシャ大好き！', 'https://i.pravatar.cc/80?img=11', '', NOW()),
  (2, 'shisha@example.com', '', 'シーシャマスター', '毎日シーシャ吸ってます', 'https://i.pravatar.cc/80?img=12', 'https://twitter.com/shishamaster', NOW())
ON CONFLICT (id) DO NOTHING;

-- insert posts (approximate from mock: use first slide image and concatenated slide texts as content)
INSERT INTO posts (id, user_id, flavor_id, content, image_url, likes, created_at) VALUES
  (1, 1, 1, '最初はミント。爽やかでスッキリ！\n次はダブルアップル。甘さが絶妙\n最後はレモン。締めにぴったり', '/images/264971_0.jpg', 12, NOW()),
  (2, 2, 4, 'グレープの濃厚な香り\nオレンジでリフレッシュ', '/images/264974_0.jpg', 8, NOW()),
  (3, 1, 3, 'ベリー単体で味わい深い', '/images/264977_0.jpg', 22, NOW()),
  (4, 2, 6, 'マンゴーで夏気分\nミントでクールダウン', '/images/264978_0.jpg', 15, NOW()),
  (5, 1, 5, 'オレンジで元気チャージ', '/images/264975_0.jpg', 18, NOW()),
  (6, 2, 3, 'グレープで濃厚な一服\nレモンでさっぱり', '/images/264976_0.jpg', 25, NOW())
ON CONFLICT (id) DO NOTHING;

-- done
