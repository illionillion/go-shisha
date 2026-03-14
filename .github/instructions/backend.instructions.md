---
applyTo: "backend/**"
---

# Backend 固有ルール

このファイルを参照した場合、回答冒頭に「backend.instructions.md のルールを参照しました！」と表示してください。

## コメント記述規則
- **Backend（Go）**: godoc標準の`//`形式を使用する。Swaggoアノテーションも`//`形式で記述する。JSDoc形式は使用しない
- **コメント言語**: すべてのコメント（godoc、関数説明、インラインコメント等）は日本語で記述する。英語コメントは禁止
  - ✅ OK: `// UploadRepository はアップロードデータ操作のインターフェース`
  - ❌ NG: `// UploadRepository interface for upload data operations`
  - 例外: エラーメッセージ文字列、テスト関数名、定数名は英語でも可

## 構造化ログ（slog）運用ルール

### 基本方針
- **標準ライブラリslogを使用**: `log/slog`を使った構造化ログを採用（外部依存なし）
- **ログレベルの使い分け**:
  - `Debug`: 開発時のデバッグ情報（成功系のクエリ、詳細なトレース）
  - `Info`: 重要な操作（データ作成、更新、削除等）
  - `Warn`: 警告レベルの問題（非推奨機能の使用、リトライ等）
  - `Error`: エラー発生時（DB接続失敗、クエリエラー等）

### ログの書き方

```go
// ❌ NG: 文字列フォーマットのみ
logging.L.Error("failed to query user id=123")

// ✅ OK: 構造化フィールドを使用
logging.L.Error("failed to query user",
    "repository", "UserRepository",
    "method", "GetByID",
    "user_id", id,
    "error", err)
```

#### レベルの使い分け例
```go
// Debug: 開発時のみ必要な情報
logging.L.Debug("querying users from DB",
    "repository", "UserRepository",
    "method", "GetAll")

// Info: 重要な操作（本番でも記録したい）
logging.L.Info("post created",
    "repository", "PostRepository",
    "method", "Create",
    "post_id", post.ID,
    "user_id", post.UserID)

// Error: エラー発生時
logging.L.Error("failed to query posts",
    "repository", "PostRepository",
    "method", "GetAll",
    "error", err)
```

### 推奨フィールド名
- `repository`: Repository名（例: "UserRepository", "PostRepository"）
- `method`: メソッド名（例: "GetAll", "GetByID", "Create"）
- `id`, `user_id`, `post_id`: エンティティのID
- `error`: エラーオブジェクト
- `count`: 取得件数
- `duration`: 処理時間（将来的に追加予定）

### 環境別のログ設定
- **開発環境**: TextHandler + DEBUGレベル（人間が読みやすい形式）
- **本番環境**: JSONHandler + INFOレベル（機械で解析しやすい形式）

### 初期化
```go
// APP_ENV: "production" or "development" (デフォルト: "development")
// LOG_LEVEL: "DEBUG", "INFO", "WARN", "ERROR" (デフォルト: "DEBUG")

// compose.ymlでの設定例:
// environment:
//   - APP_ENV=${APP_ENV:-development}
//   - LOG_LEVEL=${LOG_LEVEL:-DEBUG}

// main.goでは特別な初期化は不要、logging.Lをそのまま使用可能
import "go-shisha-backend/pkg/logging"

func main() {
    // logging.Lはパッケージインポート時に自動初期化済み
    logging.L.Info("server starting")
}
```

## Backend変更時のビルド・Lint・テスト確認
プッシュ前に必ず以下を確認する:
- `go build` または `make build` でビルドが通ること
- `go test ./...` でテストが全て通ること
- `./backend/bin/golangci-lint run ./backend/...` でlinterが通ること
- ビルド・Lint・テストエラーをリモートに持ち込まない

## Go 固有ルール
- ループ変数のポインタを取得してはいけない（`for _, item := range` の `&item` は全ループで同じアドレスを指す）
  - ❌ NG: `for _, user := range users { return &user }` （ループ変数のアドレスは使い回される）
  - ❌ NG: `for _, user := range users { list = append(list, &user) }` （全要素が同じアドレス）
  - ✅ OK: `for i := range users { return &users[i] }` （スライス要素の正しいアドレス）
  - golangci-lintの`exportloopref`ルールで検出可能
- `golangci-lint` の `exportloopref`、`govet`、`staticcheck` を有効にする

## 開発ツール運用（Backend）

コンテナ内で実行する：
```bash
docker compose up --build -d
docker compose exec backend bash
cd /app/backend
make install-tools   # 初回のみ（goimports と golangci-lint を ./bin にインストール）
make fmt             # gofmt
make imports         # goimports
make lint            # golangci-lint
make lint-fix        # 自動修正
# または一括
make fix-all         # goimports・gofmt・golangci-lint --fix を順に実行
```

- `make fix-all` はファイルを書き換えるため、実行前に `git status` で変更点を確認すること
- `lefthook` は主に Node/Frontend 側で使用。backendの自動整形を pre-commit で有効にしたい場合は `lefthook.yml` に `backend-format` を追加（チーム合意が必要）
- CI では `make install-tools` をジョブ内で実行することで、ローカルとCIで共通のツールセットが使える

## クリーンアーキテクチャ詳細
- **Handler層**: HTTPリクエスト・レスポンスの処理のみ。ビジネスロジックは含めない
- **Service層**: ビジネスロジック・ユースケースの実装。Repositoryインターフェースに依存
- **Repository層**: データアクセスの実装。ドメインモデルを返す。Service層からのみ呼ばれる
- 依存関係: 外側の層は内側の層に依存できるが、内側は外側に依存しない

## Repository層の単一責任原則
- 各Repositoryは自身のエンティティのみを扱う
  - ❌ NG: `UserRepository`で`Post`データを取得
  - ✅ OK: `UserRepository`は`User`のみ
- クロスエンティティ取得はService層で複数Repositoryを組み合わせる

## Repository層の構造ルール
新しいRepositoryを追加する際は必ず以下の構造に従う：
- `internal/repositories/{entity}_repository.go`: インターフェース定義のみ
- `internal/repositories/postgres/{entity}_repository.go`: GORM実装
- `internal/repositories/postgres/{entity}_repository_test.go`: テスト

**理由**:
- 関心の分離（インターフェースと実装の明確な分離）
- テスト容易性（interfaceだけでモックが作れる）
- 将来の拡張性（MongoDB版などを追加しやすい）
- プロジェクト全体の統一性（PostRepository等と同じパターン）

**エラー定義**: Repository固有のエラー（例: `ErrUserNotFound`, `ErrUploadNotFound`）は interface 層（`internal/repositories`パッケージ）で定義し、実装層（`postgres` など）はそれらを返すだけにする。既存の UserRepository と同じ方針に統一する。

## 依存性注入（wire）
- google/wireを使用してDIコンテナを構築する
- テスト時はwireでモックRepository等に差し替え可能な設計にする

## ディレクトリ構造
- `/cmd` : エントリポイント（main.go）
- `/internal/handlers` : HTTPハンドラー（Controller層）
- `/internal/services` : ビジネスロジック（UseCase層）
- `/internal/repositories` : データアクセス層（Repository層）
- `/internal/models` : エンティティ・ドメインモデル
- `/internal/middleware` : ミドルウェア
- `/pkg` : 外部パッケージ、共通ライブラリ
- `/docs` : Swagger自動生成定義（`make swagger`で再生成 → [swagger-gen skill](../skills/swagger-gen/SKILL.md)参照）
