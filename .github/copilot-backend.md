# Backend 固有ルール

このファイルを参照した場合、回答冒頭に「copilot-backend.md のルールを参照しました！」と表示してください。

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

#### 構造化フィールドの使用
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

### 環境別のログ設定
- **開発環境**: TextHandler + DEBUGレベル（人間が読みやすい形式）
- **本番環境**: JSONHandler + INFOレベル（機械で解析しやすい形式）

### 初期化
```go
// loggingパッケージは自動的に環境変数から初期化されます
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

### 推奨フィールド名
- `repository`: Repository名（例: "UserRepository", "PostRepository"）
- `method`: メソッド名（例: "GetAll", "GetByID", "Create"）
- `id`, `user_id`, `post_id`: エンティティのID
- `error`: エラーオブジェクト
- `count`: 取得件数
- `duration`: 処理時間（将来的に追加予定）

## Backend変更時のビルド・Lint・テスト確認
- Backend（Go）のコードを変更した場合、プッシュ前に必ず以下を確認する:
  - `go build`または`make build`でビルドが通ること
  - `go test ./...`でテストが全て通ること
  - `./backend/bin/golangci-lint run ./backend/...`でlinterも通ること
- ビルド・Lint・テストエラーをリモートに持ち込まない
- 将来的にはCI/CDで自動化予定

## Go 固有ルール
- ループ変数のポインタを取得してはいけない（`for _, item := range` の `&item` は全ループで同じアドレスを指す）。
  - ❌ NG: `for _, user := range users { return &user }` （ループ変数のアドレスは使い回される）
  - ❌ NG: `for _, user := range users { list = append(list, &user) }` （全要素が同じアドレス）
  - ✅ OK: `for i := range users { return &users[i] }` （スライス要素の正しいアドレス）
  - golangci-lintの`exportloopref`ルールで検出可能
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
    - **interface定義のみ**: 各リポジトリのインターフェースを定義（例: `upload_repository.go`）
    - `/postgres` : GORM実装
      - **実装とテスト**: 各リポジトリのGORM実装とテストを配置（例: `upload_repository.go`, `upload_repository_test.go`）
  - `/models` : エンティティ・ドメインモデル
  - `/middleware` : ミドルウェア
- `/pkg` : 外部パッケージ、共通ライブラリ

### Repository層の構造ルール
- **interface層と実装層を分離**: 新しいRepositoryを追加する際は必ず以下の構造に従う
  - `internal/repositories/{entity}_repository.go`: インターフェース定義のみ
  - `internal/repositories/postgres/{entity}_repository.go`: GORM実装
  - `internal/repositories/postgres/{entity}_repository_test.go`: テスト
- **理由**: 
  - 関心の分離（インターフェースと実装の明確な分離）
  - テスト容易性（interfaceだけでモックが作れる）
  - 将来の拡張性（MongoDB版などを追加しやすい）
  - プロジェクト全体の統一性（PostRepository等と同じパターン）
- **エラー定義**: Repository固有のエラー（例: `ErrUserNotFound`, `ErrUploadNotFound`）は interface 層（`internal/repositories`パッケージ）で定義し、実装層（`postgres` など）はそれらを返すだけにする。既存の UserRepository と同じ方針に統一する

## Swagger/OpenAPI生成（swaggo）ルール

> Swagger再生成の詳細な手順・アノテーション記述ルール・チェックリストは [skills/swagger-gen/SKILL.md](skills/swagger-gen/SKILL.md) に移動しました。
> 「Swagger更新して」「make swagger実行して」と指示するとSkillが自動でロードされます。

### 開発時に常に守る原則
- **実装とSwagger定義を一致させる**: ハンドラーの実際のレスポンス構造とSwaggerアノテーションの型定義は必ず一致させる
- **型定義を使用する**: `gin.H{}`で直接JSON構造を作るのではなく、`models`パッケージに構造体を定義して使用する
- **レスポンス構造体の命名**: `{Entity}Response`形式（例: `UsersResponse`, `PostsResponse`, `ErrorResponse`）

## 開発ツール運用（Backend）

- **コンテナ内で実行**: Backend のフォーマット・リンティング・自動修正はコンテナ内のツールセットで実行します。ローカルに直接ツールをインストールせず、まず `make -C backend install-tools` を実行してください。
-
### コンテナ内でのツールセットアップとフォーマット方針

開発は基本的にコンテナ内で行う前提です（ソースはボリュームで同期）。バックエンドのフォーマット・lint 用ツールはコンテナ内へインストールして実行する運用を推奨します。

推奨ワークフロー（コンテナ内）:

1. コンテナ起動・接続

```bash
docker compose up --build -d
docker compose exec backend bash
cd /app/backend
```

2. ツールの一括インストール（初回 or ツール更新時）

```bash
make install-tools    # goimports と golangci-lint を ./bin にインストール
```

3. フォーマット / インポート / lint の実行

```bash
make fmt              # gofmt
make imports          # goimports があれば実行（無ければスキップ）
make lint             # golangci-lint
make lint-fix         # 自動修正（可能な範囲）
```

4. 変更をホストへ反映（ボリュームマウントにより同期）

```bash
git add -A
git commit -m "style: apply formatting/lint fixes"
git push
```

運用上の注意:

- `lefthook` は主に Node/Frontend 側で使うため、backend 側の自動実行は無効にしています。backendの自動整形を pre-commit で有効にしたい場合は `lefthook.yml` に `backend-format` を追加してください（チーム合意が必要）。
- CI では `make install-tools` をジョブ内で実行することで、ローカルとCIで共通のツールセットが使えます。

---

この運用ルールはリポジトリ内に集約されています。README に短い案内を追加する場合は本セクションを参照するリンクを貼ってください。
- **ワンコマンド修正**: 一括適用用に `backend/Makefile` に `fix-all` ターゲットを用意しました。ツールが整っている状態で `make -C backend fix-all` を実行すると、`goimports`、`gofmt`、`golangci-lint --fix` 等の自動修正を順に実行します。
- **実行前確認**: `make -C backend fix-all` はファイルを書き換えます。実行前に `git status` で変更点を確認し、必要ならブランチ作成を行ってください。
- **CI整合性**: 開発者は `fix-all` 実行後に変更を push してください。CI は同一ツールセットで検証を行う想定です。


