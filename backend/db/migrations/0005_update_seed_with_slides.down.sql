-- 0005_update_seed_with_slides.down.sql
-- シードデータを元に戻す（簡易化）
-- 注意: マイグレーションのロールバックは逆順で実行されるため、
-- 0005のdown 実行時点ではまだ posts の旧カラム(flavor_id, content, image_url) は存在しません。
-- そのためこのファイルではシードの復元処理を行わず、slides/postsの削除のみを行います。
-- 元のシード復元が必要な場合は 0004 の down で行うか、別途手順を用意してください。

-- slidesとpostsを削除
DELETE FROM slides;
DELETE FROM posts;

-- シーケンスは削除後に必要に応じて手動で同期してください。
