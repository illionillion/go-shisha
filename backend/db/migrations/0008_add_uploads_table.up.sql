-- 0008_add_uploads_table.up.sql
-- 画像アップロード履歴を管理するテーブル

CREATE TABLE IF NOT EXISTS uploads (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,           -- 保存先パス（例: /images/20260131_xxx.jpg）
  original_name TEXT NOT NULL,       -- 元のファイル名
  mime_type TEXT NOT NULL,           -- MIMEタイプ（image/jpeg等）
  file_size BIGINT NOT NULL,         -- ファイルサイズ（バイト）
  status TEXT NOT NULL DEFAULT 'uploaded',  -- uploaded / used / deleted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ                -- 投稿で使用された日時
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at);

-- file_pathにユニーク制約（同じファイルが重複登録されないように）
CREATE UNIQUE INDEX IF NOT EXISTS idx_uploads_file_path ON uploads(file_path);
