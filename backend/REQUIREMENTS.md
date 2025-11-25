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
品質チェックは必ず上記手順でセットアップした上で実施してください。
