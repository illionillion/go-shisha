# フロントエンド開発ガイド

このプロジェクトは、Next.jsを使用したフロントエンドアプリケーションです。

## 開発を始めるには

### 環境変数の設定

環境変数は役割ごとにファイルを分けて管理します。

| ファイル           | git管理 | 読み込まれるタイミング              | 用途                                              |
| ------------------ | ------- | ----------------------------------- | ------------------------------------------------- |
| `.env.development` | ✅      | `pnpm dev`（NODE_ENV=development）  | ローカル開発のデフォルト値                        |
| `.env.production`  | ✅      | `next build`（NODE_ENV=production） | 本番ビルド時の設定（BACKEND_URLは意図的に未設定） |
| `.env.local`       | ❌      | 常に読み込み（両環境で上書き）      | 機密情報・個人環境の値                            |

**セットアップ手順（ローカル開発）：**

`.env.development` に必要な変数とコメントが記載されています。機密情報のみ `.env.local` に設定してください。

```bash
# frontend/ ディレクトリで実行
echo "REDIRECT_SECRET=$(openssl rand -hex 32)" >> .env.local
```

**環境変数の説明:**

| 変数名            | ファイル           | 説明                               | 必須 |
| ----------------- | ------------------ | ---------------------------------- | ---- |
| `BACKEND_URL`     | `.env.development` | `pnpm dev` 時のバックエンドURL     | ✅   |
| `REDIRECT_SECRET` | `.env.local`       | ログイン後リダイレクト先暗号化キー | ✅   |

> **Codespacesで開発する場合**:
>
> `.env.local` に `BACKEND_URL=https://<workspace>-8080.app.github.dev` を追加してください。

> **注意**: プロジェクトルートの`.env`（Backend用）も別途必要です。詳細はルートの[README.md](../README.md)を参照してください。

### Docker Compose を使用する場合（推奨）

プロジェクトルートで以下を実行：

```bash
docker compose up
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8080](http://localhost:8080)
- OpenAPI仕様の変更を自動検知してAPI型を再生成します

### 本番イメージのビルド（ECS Fargate 用）

`BACKEND_URL` は `rewrites()` の設定としてビルド時に焼き込まれ、また `api-client.ts` がサーバーサイドでランタイムに参照します。
`.env.production` では `BACKEND_URL` を意図的に未設定にしているため、`--build-arg` で渡さないとビルドエラーになります。

**ローカルでビルドする場合：**

`frontend/.env.local` はビルドコンテキストから除外されるため、`--build-arg BACKEND_URL=...` の指定が必須です。

```bash
# リポジトリルートで実行
docker build \
  --build-arg BACKEND_URL=http://<バックエンドコンテナ名>:8080 \
  -f Dockerfile.frontend.prod --target prod \
  -t go-shisha-frontend-prod .
```

> **コンテナ名について**: Docker Compose で起動したバックエンドのコンテナ名はプロジェクトのディレクトリ名に依存します（例: ディレクトリが `go-shisha-2` なら `go-shisha-2-backend-1`）。環境ごとに適宜読み替えてください。

**CI/CD（GitHub Actions 等）でビルドする場合：**

CI の Secrets に `BACKEND_URL` を設定し、`--build-arg` で渡します。

起動例（`REDIRECT_SECRET` はランタイムのみで渡す）：

```bash
docker run -d --rm \
  --name go-shisha-frontend \
  --network <プロジェクトディレクトリ名>_default \
  -e BACKEND_URL=http://<バックエンドコンテナ名>:8080 \
  -e REDIRECT_SECRET=<32バイト16進数> \
  -p 3000:3000 \
  go-shisha-frontend-prod
```

停止（FE・BE 両方）：

```bash
# フロントエンドコンテナを停止（docker run の --name に指定した名前に読み替える）
docker stop go-shisha-frontend

# バックエンド・DB を停止（プロジェクトルートで実行）
docker compose down
```

> **補足**: `--rm` フラグを付けて起動した場合、停止と同時にコンテナは自動削除されます。

### ローカル環境で直接実行する場合

1. **依存関係のインストール**

   ```bash
   pnpm install
   ```

2. **開発サーバーの起動**
   ```bash
   pnpm dev
   ```
   ブラウザで [http://localhost:3000](http://localhost:3000) を開いて動作を確認してください。

## OpenAPI連携

このプロジェクトでは、[orval](https://orval.dev/) を使用してOpenAPI仕様からTypeScriptの型とAPIクライアントを自動生成しています。

### 自動生成（Docker環境）

Docker Compose環境では、`openapi/openapi.yml`の変更を`nodemon`が自動検知し、API型を再生成します。

### 手動生成

1. **OpenAPI仕様のコピー**

   ```bash
   # プロジェクトルートで実行
   ./scripts/copy-openapi.sh
   ```

   backendからOpenAPI仕様（swagger.yaml）をコピーします。

2. **型とAPIクライアントの生成**
   ```bash
   pnpm gen:api
   ```
   コピーしたOpenAPI仕様を元に、`api`ディレクトリに型とクライアントを生成します。

### 注意点

- `openapi/openapi.yml` はgit管理対象外です。必ずスクリプトを使用してコピーしてください。
- `api`ディレクトリ内の生成物はgit管理対象です。変更があればコミットしてください。
- 設定ファイルは `orval.config.ts` にあります。必要に応じてクライアントの種類（例: `fetch`, `react-query`）や出力先を変更してください。

## Storybook

UIコンポーネントの開発と確認にはStorybookを使用します。

### Storybookの起動

```bash
pnpm storybook
```

ブラウザで [http://localhost:6006](http://localhost:6006) を開いてStorybookを確認できます。

### Storybookのビルド

```bash
pnpm build-storybook
```

## Visual Regression Test (VRT)

UIコンポーネントの視覚的な差分を自動検出するVRT環境が構築されています。

### VRTの実行

**前提条件**: Storybookが起動している必要があります。

```bash
# 別ターミナルでStorybookを起動
pnpm storybook

# VRTを実行
pnpm vrt
```

### スナップショットの更新

意図的なUI変更を行った場合は、スナップショットを更新します。

```bash
pnpm vrt:update
```

**注意**: スナップショット更新後は必ず差分を目視確認し、PRで変更内容を明示してください。

### VRT対象コンポーネント

VRTは `tags: ['vrt']` が付与されたStoryのみが対象となります。

```tsx
const meta = {
  title: "UI/MyComponent",
  component: MyComponent,
  tags: ["autodocs", "vrt"], // vrtタグを追加
  // ...
} satisfies Meta<typeof MyComponent>;

// もしくは各Storyに個別で適用
export const Default: Story = {
  tags: ["vrt"],
  args: {},
};
```

### CI/CDでのVRT

- PR作成時に自動的にVRTが実行されます
- 差分が検出された場合、Artifactsに差分画像がアップロードされます
- 失敗時はPRコメントで通知されます

### VRT運用ルール

詳細は `.github/copilot-vrt.md` を参照してください。運用ルールに従い、CI/PR の VRT 実行は Docker イメージ上で行います。

## その他

- Next.jsの詳細なドキュメントは [公式サイト](https://nextjs.org/docs) を参照してください。
- 質問や問題があればプロジェクトのIssueに投稿してください。
