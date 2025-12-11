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
- Node.js 20+
- pnpm 9+
- Go 1.21+
- PostgreSQL 14+
- Docker & Docker Compose

### セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/illionillion/go-shisha.git
cd go-shisha
```

2. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集
```

3. 依存関係をインストール
```bash
pnpm install
```

4. Backendを起動（Docker）
```bash
docker compose up -d
```

5. Frontendを起動
```bash
pnpm dev
```

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

### 開発コマンド

#### モノレポルート
```bash
pnpm dev              # Frontend開発サーバー起動 + OpenAPI自動コピー監視
pnpm build            # Frontendビルド
pnpm lint             # Frontendリント
pnpm format           # Frontendフォーマット
pnpm test             # Frontendテスト
pnpm storybook        # Storybook起動
pnpm vrt:build        # VRT Docker環境ビルド
pnpm vrt:up           # VRT Docker環境起動
pnpm vrt:run          # VRT実行
```

#### Backend（Go）
```bash
cd backend
make dev              # 開発サーバー起動（Air使用）
make build            # ビルド
make test             # テスト実行
make swagger          # Swagger定義再生成
```

### 開発フロー

1. Backendでswagger定義を更新 → `make swagger`
2. OpenAPI自動コピー（`scripts/watch-openapi.ts`が自動実行）
3. Orval自動生成（nodemonが自動実行）
4. FrontendでAPI型定義が更新される

### Git Hooks（lefthook）

- **pre-commit**: lint-stagedでlint/format自動実行
- **commit-msg**: commitlint（Conventional Commits検証）
- **post-checkout/merge/rewrite**: pnpm install自動実行

## プロジェクト詳細

詳細な要件定義については [REQUIREMENTS.md](./REQUIREMENTS.md) を参照してください。

## ライセンス

MIT License

