# フロントエンド開発ガイド

このプロジェクトは、Next.jsを使用したフロントエンドアプリケーションです。

## 開発を始めるには

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

### 手順

1. **OpenAPI仕様のコピー**

   ```bash
   # プロジェクトルートで実行
   sh scripts/copy-openapi.sh
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

## その他

- Next.jsの詳細なドキュメントは [公式サイト](https://nextjs.org/docs) を参照してください。
- 質問や問題があればプロジェクトのIssueに投稿してください。
