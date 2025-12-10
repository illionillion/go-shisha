# Go-Shisha

NextとGoのモノレポで構築されたシーシャSNSアプリケーション

## プロジェクト構成（予定）

```
go-shisha/
├── frontend/          # Next.js application
├── backend/           # Go API server
├── shared/            # 共有型定義・設定
└── docs/             # ドキュメント
```

## 技術スタック

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Query/TanStack Query
- Vitest
- Playwright
- Storybook
- ovral

### Backend
- Go 1.21+
- Gin Framework
- PostgreSQL
- JWT認証

### Infrastructure（未定）
- Dev: Docker
- Frontend: Vercel（AWSにしたい）
- Backend: Railway/Render（AWSにしたい）
- Database: PostgreSQL (managed)
- File Storage: AWS S3/Cloudinary

## 開発

### 要求事項
- Node.js 18+
- Go 1.21+
- PostgreSQL 14+

### 環境変数

`.env`ファイルを作成し、以下の内容を記載してください。

```env
TZ=Asia/Tokyo                                      # タイムゾーン
BACKEND_PORT=8080                                  # バックエンドの公開ポート
```

### 各変数の説明
- `TZ`: Dockerコンテナのタイムゾーン設定
- `BACKEND_PORT`: バックエンドAPIの公開ポート

> 詳細は `.env.example` を参照してください。

## プロジェクト詳細

詳細な要件定義については [REQUIREMENTS.md](./REQUIREMENTS.md) を参照してください。

## ライセンス

MIT License

