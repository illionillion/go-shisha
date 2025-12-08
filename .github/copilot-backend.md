# Backend 固有ルール

このファイルを参照した場合、回答冒頭に「copilot-backend.md のルールを参照しました！」と表示してください。

## コメント記述規則
- **Backend（Go）**: godoc標準の`//`形式を使用する。Swaggoアノテーションも`//`形式で記述する。JSDoc形式は使用しない

## Backend変更時のビルド・Lint・テスト確認
- Backend（Go）のコードを変更した場合、プッシュ前に必ず以下を確認する:
  - `go build`または`make build`でビルドが通ること
  - `go test ./...`でテストが全て通ること
  - `./backend/bin/golangci-lint run ./backend/...`でlinterも通ること
- ビルド・Lint・テストエラーをリモートに持ち込まない
- 将来的にはCI/CDで自動化予定

## Go 固有ルール
- ループ変数のアドレスを返してはいけない（例: `for _, user := range users { return &user }` はNG）。
  代わりにスライスのインデックスを使う: `for i := range users { return &users[i] }`。
  golangci-lint の `exportloopref` ルールで検出する設定を推奨する。
- `golangci-lint` を導入し、`exportloopref`、`govet`、`staticcheck` を有効にする。

## クリーンアーキテクチャ詳細
- 各層の責務と依存関係ルール
  - Handler層: HTTPリクエスト・レスポンスの処理のみ。ビジネスロジックは含めない。
  - Service層: ビジネスロジック・ユースケースの実装。Repositoryインターフェースに依存。
  - Repository層: データアクセスの実装。ドメインモデルを返す。Service層からのみ呼ばれる。
  - 依存関係: 外側の層は内側の層に依存できるが、内側は外側に依存しない。

## Repository層の単一責任原則
- 各Repositoryは自身のエンティティのみを扱う。
  - ❌ NG: `UserRepository`で`Post`データを取得
  - ✅ OK: `UserRepository`は`User`のみ、`PostRepository`は`Post`のみ
- クロスエンティティ取得はService層で複数Repositoryを組み合わせる

## 依存性注入（wire）
- google/wireを使用してDIコンテナを構築する
- テスト時はwireでモックRepository等に差し替え可能な設計にする

## ディレクトリ構造
- `/cmd` : エントリポイント（main.go）
- `/internal` : アプリケーションコード
  - `/handlers` : HTTPハンドラー（Controller層）
  - `/services` : ビジネスロジック（UseCase層）
  - `/repositories` : データアクセス層（Repository層）
  - `/models` : エンティティ・ドメインモデル
  - `/middleware` : ミドルウェア
- `/pkg` : 外部パッケージ、共通ライブラリ
