-- 0004_add_refresh_tokens.down.sql
-- Refresh Token管理テーブルの削除

DROP INDEX IF EXISTS idx_refresh_tokens_expires_at;
DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
DROP TABLE IF EXISTS refresh_tokens;
