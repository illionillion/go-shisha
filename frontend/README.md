# フロントエンド開発ガイド

このプロジェクトは、Next.jsを使用したフロントエンドアプリケーションです。

## 開発を始めるには

### 環境変数の設定

**Frontend専用の環境変数**を設定します。

```bash
# frontend/.env.exampleをコピー
cp .env.example .env

# REDIRECT_SECRETにランダムな値を設定（32バイトの16進数）
echo "REDIRECT_SECRET=$(openssl rand -hex 32)" >> .env
```

**環境変数の説明:**

| 変数名                    | 説明                                                | デフォルト値            | 必須 |
| ------------------------- | --------------------------------------------------- | ----------------------- | ---- |
| `NEXT_PUBLIC_BACKEND_URL` | バックエンドURL（画像などの公開URL）                | `http://localhost:8080` | ✅   |
| `BACKEND_URL`             | Next.js rewrites用バックエンドURL（内部プロキシ先） | `http://localhost:8080` | ✅   |
| `REDIRECT_SECRET`         | ログイン後リダイレクト先暗号化キー                  | -                       | ✅   |

> **Codespacesで開発する場合**: `BACKEND_URL`を`https://<workspace>-8080.app.github.dev`に変更してください。

> **注意**: プロジェクトルートの`.env`（Backend用）も別途必要です。詳細はルートの[README.md](../README.md)を参照してください。

### Docker Compose を使用する場合（推奨）

プロジェクトルートで以下を実行：

```bash
docker compose up
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8080](http://localhost:8080)
- OpenAPI仕様の変更を自動検知してAPI型を再生成します

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
