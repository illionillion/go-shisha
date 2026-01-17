-- 0005_update_seed_with_slides.down.sql
-- シードデータを元に戻す
-- 依存: このdownを実行する前に0004のdownが実行されている必要があります
-- （flavor_id, content, image_urlカラムが復元済みである必要があります）

-- slidesとpostsを削除
DELETE FROM slides;
DELETE FROM posts;

-- 元のシードデータを復元（0003で追加したデータ）
-- 元のシードデータを復元（0003で追加したデータ）
-- 注意: ロールバック時の実行順序に依存しないよう、必要なカラムが存在する場合のみ挿入処理を行います。
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'posts'
      AND column_name IN ('flavor_id', 'content', 'image_url')
    GROUP BY table_name
    HAVING COUNT(*) = 3
  ) THEN
    INSERT INTO posts (id, user_id, flavor_id, content, image_url, likes, created_at) VALUES
      (1, 1, 1, '最初はミント。爽やかでスッキリ！\n次はダブルアップル。甘さが絶妙\n最後はレモン。締めにぴったり', '/images/264971_0.jpg', 12, NOW()),
      (2, 2, 4, 'グレープの濃厚な香り\nオレンジでリフレッシュ', '/images/264974_0.jpg', 8, NOW()),
      (3, 1, 3, 'ベリー単体で味わい深い', '/images/264977_0.jpg', 22, NOW()),
      (4, 2, 6, 'マンゴーで夏気分\nミントでクールダウン', '/images/264978_0.jpg', 15, NOW()),
      (5, 1, 5, 'オレンジで元気チャージ', '/images/264975_0.jpg', 18, NOW()),
      (6, 2, 3, 'グレープで濃厚な一服\nレモンでさっぱり', '/images/264976_0.jpg', 25, NOW())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;

-- シーケンス同期（postsテーブルが存在する場合のみ）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'posts') THEN
    PERFORM setval(pg_get_serial_sequence('posts','id'), COALESCE((SELECT MAX(id) FROM posts), 1), true);
  END IF;
END;
$$;
