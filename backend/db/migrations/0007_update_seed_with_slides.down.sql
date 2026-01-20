-- 0005_update_seed_with_slides.down.sql
-- 0005 の down は 0004 の down と実行順が逆になるため注意が必要です。
-- (通常: rollback は適用した順の逆で実行される -> 0005 down -> 0004 down)
-- このファイルでは、slides/posts の削除は常に実行し、
-- 元の posts の旧カラム(flavor_id, content, image_url) が存在する場合にのみ
-- 元のシード復元を試みます（存在しない場合は復元処理をスキップします）。

-- slides と posts を削除（常に実行）
DELETE FROM slides;
DELETE FROM posts;

-- シーケンスは削除後に必要に応じて手動で同期してください。

-- 以下は、posts テーブルに旧カラムが揃っている場合のみシードを復元する安全な処理
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
		-- posts テーブルに旧カラムが存在するので、元のシードを挿入する
		INSERT INTO posts (id, user_id, flavor_id, content, image_url, likes, created_at) VALUES
			(1, 1, 1, '最初はミント。爽やかでスッキリ！\n次はダブルアップル。甘さが絶妙\n最後はベリー。締めにぴったり', '/images/264971_0.jpg', 12, NOW()),
			(2, 2, 6, 'グレープの濃厚な香り\nオレンジでリフレッシュ', '/images/264974_0.jpg', 8, NOW()),
			(3, 1, 3, 'ベリー単体で味わい深い', '/images/264977_0.jpg', 22, NOW()),
			(4, 2, 4, 'マンゴーで夏気分\nミントでクールダウン', '/images/264978_0.jpg', 15, NOW()),
			(5, 1, 5, 'オレンジで元気チャージ', '/images/264975_0.jpg', 18, NOW()),
			(6, 2, 6, 'グレープで濃厚な一服\nベリーでさっぱり', '/images/264976_0.jpg', 25, NOW())
		ON CONFLICT (id) DO NOTHING;
	END IF;
END;
$$;
