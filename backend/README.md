# 必須ツール・セットアップ手順

## Go
- バージョン: 1.24.x 以上
- インストール: https://go.dev/doc/install
- ※ `go` コマンドがPATHに通っている必要あり

## golangci-lint
Goコードの静的解析ツール。CI/CD・ローカル品質チェックで必須。

### インストール方法（bin直指定運用）
1. プロジェクトルートで以下を実行
```bash
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b ./backend/bin latest
```
2. `./backend/bin/golangci-lint` が生成されます（必ず backend/bin 配下にダウンロードされます）

### 実行コマンド
```bashcurl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s latest
./backend/bin/golangci-lint run ./backend/...
```
- Go本体のPATHが通っている必要があります
- バージョン確認: `./backend/bin/golangci-lint --version`

---

## Swagger のセットアップ
Swagger ドキュメント生成ツール `swag` をインストールする必要があります。

## マイグレーションとシード運用

### マイグレーションの場所
- マイグレーションファイルは `backend/db/migrations` に配置します。ファイル名は番号付きで管理し、ツールが番号順に適用します（例: `0001_init.up.sql`, `0002_add_columns.up.sql`, `0003_seed.up.sql`）。

### 自動適用の仕組み
- 開発環境では `compose.yml` に定義した `migrate` サービス（`migrate/migrate:latest`）が起動時に `migrate up` を実行します。`docker compose up -d` でマイグレーションが適用される運用を想定しています。

### シード（初期データ）の扱い
- 必須の初期データ（フレーバーなど）はマイグレーションとして `0003_seed.up.sql` のように配置してください。`migrate up` により自動投入されます。
- 開発用の大量データや手動での再投入が必要な場合は `backend/db/seeds/` 配下にテンプレートを置き、必要時に手動で適用してください。手動適用の例:

```sh
docker compose exec -T -i postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} < backend/db/seeds/initial_seed.sql
```

### 安全対策
- マイグレーション内の挿入は idempotent（`INSERT ... ON CONFLICT DO NOTHING` 等）にしてください。シーケンスは `setval(...)` で同期してください。

### CIでの運用メモ
- CIではジョブ内で Postgres を立ち上げた後に `migrate up` を実行し、その後テストを実行するワークフローを推奨します。

---
### 手順
1. 依存関係を整理する:
   ```bash
   go mod tidy
   ```

2. `swag` をインストールする:
   ```bash
   go install github.com/swaggo/swag/cmd/swag@latest
   ```

3. インストール確認:
   ```bash
   swag --version
   ```
   正常にインストールされていれば、バージョン情報が表示されます。

4. Swagger ドキュメントを生成する:
   ```bash
   make swagger
   ```

---
品質チェックは必ず上記手順でセットアップした上で実施してください。
