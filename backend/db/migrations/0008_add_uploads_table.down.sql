-- 0008_add_uploads_table.down.sql
-- uploadsテーブルを削除

DROP INDEX IF EXISTS idx_uploads_file_path;
DROP INDEX IF EXISTS idx_uploads_created_at;
DROP INDEX IF EXISTS idx_uploads_status;
DROP INDEX IF EXISTS idx_uploads_user_id;
DROP TABLE IF EXISTS uploads;
