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
- PostgreSQL 14+（Dockerで自動セットアップ）
- Docker & Docker Compose

### クイックスタート（初めての方向け）

Dockerを使って最速でセットアップする方法です。

```bash
# 1. リポジトリをクローン
git clone https://github.com/illionillion/go-shisha.git
cd go-shisha

# 2. 環境変数を一括セットアップ（ルート + Frontend）
cp .env.example .env
cp frontend/.env.example frontend/.env
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')" >> .env
echo "REDIRECT_SECRET=$(openssl rand -hex 32)" >> frontend/.env

# 3. 依存関係をインストール
pnpm install

# 4. すべて起動（Backend + Frontend）
docker compose up -d  # Backendを起動
pnpm dev             # Frontendを起動（別ターミナルで実行）
```

起動後、以下のURLにアクセス:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html

### セットアップ

#### 1. リポジトリをクローン
```bash
git clone https://github.com/illionillion/go-shisha.git
cd go-shisha
```

#### 2. 環境変数を設定

##### ルート環境変数（Backend用）
```bash
# .env.exampleをコピー
cp .env.example .env

# JWT_SECRETにランダムな値を設定（64文字以上推奨）
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')" >> .env
```

##### Frontend環境変数
```bash
# frontend/.env.exampleをコピー
cp frontend/.env.example frontend/.env

# REDIRECT_SECRETにランダムな値を設定（32バイトの16進数）
echo "REDIRECT_SECRET=$(openssl rand -hex 32)" >> frontend/.env
```

**環境変数の説明:**

**ルート `.env` (Backend・Docker用)**
| 変数名 | 説明 | デフォルト値 | 必須 |
|--------|------|--------------|------|
| `TZ` | Dockerコンテナのタイムゾーン設定 | `Asia/Tokyo` | ✅ |
| `BACKEND_PORT` | バックエンドAPIの公開ポート | `8080` | ✅ |
| `POSTGRES_USER` | PostgreSQLのユーザー名 | `go_shisha` | ✅ |
| `POSTGRES_PASSWORD` | PostgreSQLのパスワード | `password` | ✅ |
| `POSTGRES_DB` | PostgreSQLのデータベース名 | `go_shisha_dev` | ✅ |
| `POSTGRES_PORT` | PostgreSQLのポート | `5432` | ✅ |
| `APP_ENV` | アプリケーション環境 | `development` | ❌ |
| `LOG_LEVEL` | ログレベル | `DEBUG` | ❌ |
| `FRONTEND_URL` | フロントエンドURL（CORS設定用） | `http://localhost:3000` | ✅ |
| `JWT_SECRET` | JWT認証用シークレットキー（64文字以上） | - | ✅ |

**frontend/.env (Frontend用)**
| 変数名 | 説明 | デフォルト値 | 必須 |
|--------|------|--------------|------|
| `NEXT_PUBLIC_BACKEND_URL` | バックエンドURL（画像などの公開URL） | `http://localhost:8080` | ✅ |
| `BACKEND_URL` | Next.js rewrites用バックエンドURL | `http://localhost:8080` | ✅ |
| `REDIRECT_SECRET` | ログイン後リダイレクト先暗号化キー | - | ✅ |

> **注意**: `JWT_SECRET`と`REDIRECT_SECRET`は**本番環境では必ずランダムな値に変更**してください。

#### 3. 依存関係をインストール
```bash
pnpm install
```

#### 4. Backendを起動（Docker）
```bash
docker compose up -d
```

初回起動時にデータベースのマイグレーション・シードが自動で実行されます。

#### 5. Frontendを起動
```bash
pnpm dev
```

ブラウザで以下のURLにアクセス:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html

#### トラブルシューティング

**環境変数が反映されない場合**
- `.env`ファイルと`frontend/.env`ファイルが存在することを確認
- Docker環境の場合は`docker compose down`後に再度`docker compose up -d`

**ポート競合が発生した場合**
- `.env`の`BACKEND_PORT`を変更（例: `8081`）
- `frontend/.env`の`NEXT_PUBLIC_BACKEND_URL`と`BACKEND_URL`も合わせて変更

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

