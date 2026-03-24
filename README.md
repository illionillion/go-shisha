# Go-Shisha

NextとGoのモノレポで構築されたシーシャSNSアプリケーション

## デモ

![シーシャ行こう デモ](./docs/demo.gif)

## プロジェクト構成

```
go-shisha/
├── frontend/          # Next.js アプリケーション
├── backend/           # Go API サーバー
├── scripts/           # 自動化スクリプト（OpenAPI同期など）
└── docs/              # GitHub Pages 用の静的アセット（API docs + デモ）
```

### Frontend ディレクトリ構成

```
frontend/
├── app/               # Next.js App Router（ページ・レイアウト）
│   ├── login/         # ログインページ
│   ├── register/      # ユーザー登録ページ
│   ├── posts/[id]/    # 投稿詳細ページ
│   └── profile/[id]/  # プロフィールページ
├── features/          # 機能別モジュール（bulletproof-react）
│   ├── auth/          # 認証関連（ログイン・登録フォームなど）
│   └── posts/         # 投稿関連（タイムライン・投稿カードなど）
├── components/        # 汎用UIコンポーネント
│   ├── Avatar/        # アバター
│   ├── Header/        # ヘッダー
│   ├── FlavorLabel/   # フレーバーラベル
│   └── icons/         # アイコン群
├── api/               # Orval自動生成 API クライアント（git管理対象）
├── openapi/           # OpenAPI仕様ファイル（git管理対象外・自動コピー）
├── types/             # 共通型定義（domain.ts で生成型を再エクスポート）
├── lib/               # ユーティリティ関数・hooks
├── remotion/          # Remotion動画コンポーネント（デモGIF生成用）
└── public/            # 静的ファイル
```

### Backend ディレクトリ構成

```
backend/
├── cmd/               # エントリポイント（main.go）
├── internal/
│   ├── handlers/      # HTTPハンドラー（Controller層）
│   ├── services/      # ビジネスロジック（UseCase層）
│   ├── repositories/  # データアクセス層（Repository層）
│   │   └── postgres/  # PostgreSQL GORM実装
│   ├── models/        # エンティティ・ドメインモデル
│   └── middleware/    # ミドルウェア（認証・レートリミットなど）
├── pkg/               # 共通ライブラリ（logging など）
├── db/
│   ├── migrations/    # DBマイグレーションファイル
│   └── seeds/         # 開発用シードデータ
└── docs/              # Swagger自動生成定義
```

## 技術スタック

### Frontend
- **Next.js 16+** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **TanStack Query v5**（サーバー状態管理）
- **Zustand v5**（クライアント状態管理）
- **react-hook-form + Zod**（フォーム・バリデーション）
- **class-variance-authority + clsx**（スタイルバリアント管理）
- **framer-motion**（アニメーション）
- **Orval**（OpenAPIからTypeScriptクライアント自動生成）
- **Vitest + Testing Library**（ユニットテスト）
- **Storybook 10**（UIコンポーネント開発）
- **Playwright + jest-image-snapshot**（VRT: ビジュアルリグレッションテスト）
- **Remotion**（デモGIF・動画生成）

### Backend
- **Go 1.24+**
- **Gin Framework**（HTTPルーター）
- **GORM**（ORM）
- **PostgreSQL 15**
- **JWT認証**（golang-jwt/jwt v5）
- **Refresh Token**（トークンリフレッシュ対応）
- **golang-migrate**（DBマイグレーション）
- **swag**（Swagger定義自動生成）
- **golangci-lint**（静的解析）
- **Air**（ホットリロード開発サーバー）

### インフラ
- **開発環境**: Docker + Docker Compose
- **DBマイグレーション**: migrate/migrate（コンテナ起動時に自動実行）
- **CI/CD**: GitHub Actions

## 実装済み機能

| 機能 | 内容 |
|------|------|
| ユーザー登録 | メールアドレス・パスワード・表示名でアカウント作成 |
| ログイン / ログアウト | JWT認証（アクセストークン + リフレッシュトークン） |
| タイムライン | 全投稿をグリッド表示（SSR + クライアントフェッチ） |
| フレーバーフィルター | フレーバー別に投稿を絞り込み |
| 投稿作成 | 複数スライド（画像 + テキスト + フレーバー）を組み合わせた投稿 |
| 投稿詳細 | スライドをカルーセル表示、フレーバーラベル付き |
| 投稿編集 | スライドのテキスト・フレーバーを編集 |
| 投稿削除 | 自分の投稿を削除（論理削除） |
| いいね / いいね解除 | 投稿へのいいね機能 |
| 画像アップロード | サーバーサイドに画像をアップロードしURLを取得 |
| プロフィール閲覧 | ユーザー情報と投稿一覧を表示 |
| プロフィール編集 | 表示名・アイコン・リンクを更新 |
| フレーバー管理 | フレーバー一覧取得（シードデータで初期投入済み） |

## 開発

### 要求事項
- **Node.js** 20.19.0 以上（21系を除く）または 22.12.0 以上
- **pnpm 9+**
- **Go 1.24+**
- **Docker & Docker Compose**（PostgreSQL・Backendはコンテナで動作）

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

# 4a. Backendを起動（Docker）
docker compose up -d

# 4b. Frontendを起動（別ターミナルで実行）
pnpm dev
```

起動後、以下のURLにアクセス:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI (ローカル)**: http://localhost:8080/swagger/index.html
- **API ドキュメント (公開)**: https://illionillion.github.io/go-shisha/

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
| `BACKEND_URL` | Next.js rewrites用バックエンドURL（内部プロキシ先） | `http://localhost:8080` | ✅ |
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
- **Swagger UI (ローカル)**: http://localhost:8080/swagger/index.html
- **API ドキュメント (公開)**: https://illionillion.github.io/go-shisha/

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
pnpm check            # 型チェック + lint + フォーマット確認
pnpm fix              # 型チェック + lint自動修正 + フォーマット
pnpm test             # Frontendテスト（watchモード）
pnpm test:run         # Frontendテスト（一回実行）
pnpm test:coverage    # カバレッジ付きテスト実行
pnpm storybook        # Storybook起動（http://localhost:6006）
pnpm gen:api:docs     # Redocを使ってdocs/index.htmlを生成（GitHub Pages用）
pnpm vrt:build        # VRT Docker環境ビルド
pnpm vrt:up           # VRT Docker環境起動
pnpm vrt:run          # VRT実行（PC + SP）
pnpm vrt:update       # VRTスナップショット更新
pnpm vrt:down         # VRT Docker環境停止
```

#### Backend（Go）
```bash
cd backend
make dev              # 開発サーバー起動（swagger再生成 + Air ホットリロード）
make build            # ビルド
make test             # テスト実行
make swagger          # Swagger定義再生成
make install-tools    # golangci-lint + goimports をインストール（初回のみ）
make fmt              # gofmt でフォーマット
make imports          # goimports でインポート整理
make lint             # golangci-lint で静的解析
make lint-fix         # golangci-lint 自動修正
make fix-all          # goimports + gofmt + golangci-lint --fix を一括実行
```

### 開発フロー

1. Backendでswagger定義を更新 → `make swagger`
2. OpenAPI自動コピー（`scripts/watch-openapi.ts`が自動実行）
3. Orval自動生成（nodemonが自動実行）
4. FrontendでAPI型定義が更新される

### APIドキュメント更新手順

`main`ブランチへのpush時に GitHub Actions が自動で以下を実行し、GitHub Pages を更新します。

1. `pnpm gen:api:docs` で `backend/docs/swagger.yaml` を読み込み `docs/index.html` を生成
2. `docs/` 配下を GitHub Pages へデプロイ

**公開URL**: https://illionillion.github.io/go-shisha/

ローカルで確認したい場合:
```bash
# Swagger定義を最新化（backend/ディレクトリで実行）
make swagger

# APIドキュメントHTMLを生成
pnpm gen:api:docs

# docs/index.html をブラウザで開く
open docs/index.html
```

### Git Hooks（lefthook）

- **pre-commit**: lint-stagedでlint/format自動実行
- **commit-msg**: commitlint（Conventional Commits検証）
- **post-checkout/merge/rewrite**: pnpm install自動実行

## プロジェクト詳細

詳細な要件定義については [REQUIREMENTS.md](./REQUIREMENTS.md) を参照してください。

## ライセンス

MIT License

