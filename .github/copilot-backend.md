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
  - `/models` : エンティティ・ドメインモデル
  - `/middleware` : ミドルウェア
- `/pkg` : 外部パッケージ、共通ライブラリ

## Swagger/OpenAPI生成（swaggo）ルール

### 基本原則
- **実装とSwagger定義を一致させる**: ハンドラーの実際のレスポンス構造とSwaggerアノテーションの型定義は必ず一致させる
- **型定義を使用する**: `gin.H{}`で直接JSON構造を作るのではなく、`models`パッケージに構造体を定義して使用する
- **レスポンス構造体の命名**: `{Entity}Response`形式（例: `UsersResponse`, `PostsResponse`, `ErrorResponse`）

### Swaggerアノテーション記述ルール

#### ハンドラー関数のアノテーション
```go
// @Summary 短い概要（日本語OK）
// @Description 詳細な説明（複数行可、改行は保持される）
// @Tags タグ名（APIのグループ化に使用）
// @Accept json
// @Produce json
// @Param パラメータ名 in 型 required "説明"
// @Success ステータスコード {object|array} モデル名 "説明"
// @Failure ステータスコード {object} モデル名 "説明"
// @Router /path [method]
```

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

#### 型定義の対応例

**❌ NG: 実装とアノテーションが不一致**
```go
// @Success 200 {array} models.User "ユーザー一覧"
func (h *UserHandler) GetAllUsers(c *gin.Context) {
    // 実際は配列ではなくオブジェクト（users, total）を返している
    c.JSON(http.StatusOK, gin.H{
        "users": users,
        "total": len(users),
    })
}
```

**✅ OK: レスポンス構造体を定義して使用**
```go
// models/user.go
type UsersResponse struct {
    Users []User `json:"users"`
    Total int    `json:"total"`
}

// handlers/user_handler.go
// @Success 200 {object} models.UsersResponse "ユーザー一覧と総数"
func (h *UserHandler) GetAllUsers(c *gin.Context) {
    users, err := h.userService.GetAllUsers()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    response := models.UsersResponse{
        Users: users,
        Total: len(users),
    }
    c.JSON(http.StatusOK, response)
}
```

### レスポンス構造体の設計指針
1. **リスト系エンドポイント**: 配列だけでなく総数も含める
   ```go
   type UsersResponse struct {
       Users []User `json:"users"`
       Total int    `json:"total"`
   }
   ```

2. **単一エンティティ取得**: 構造体を直接返す
   ```go
   // @Success 200 {object} models.User "ユーザー情報"
   c.JSON(http.StatusOK, user)
   ```

3. **エラーレスポンス**: 統一した構造体を使用（将来実装）
   ```go
   type ErrorResponse struct {
       Error   string `json:"error"`
       Code    string `json:"code,omitempty"`
       Details string `json:"details,omitempty"`
   }
   ```

### Swagger再生成フロー
1. モデル定義（`internal/models/*.go`）でレスポンス構造体を追加
2. ハンドラー（`internal/handlers/*.go`）でアノテーションと実装を修正
3. `cd backend && swag init -g cmd/main.go -o docs` で再生成
4. `backend/docs/swagger.yaml` が更新される
5. （モノレポ環境）`scripts/watch-openapi.ts` が自動的にフロントエンドにコピー
6. （モノレポ環境）nodemon が Orval を実行してフロントエンドの型・API関数を再生成

### チェックリスト
- [ ] レスポンス構造体を`models`パッケージに定義した
- [ ] ハンドラーの実装で構造体を使用している（`gin.H{}`を直接使っていない）
- [ ] Swaggerアノテーションの`@Success`型が実装と一致している
- [ ] `swag init`を実行してエラーが出ないことを確認した
- [ ] 生成された`swagger.yaml`でレスポンス定義が正しいことを確認した
