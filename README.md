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

## プロジェクト詳細

詳細な要件定義については [REQUIREMENTS.md](./REQUIREMENTS.md) を参照してください。

## ライセンス

MIT License

