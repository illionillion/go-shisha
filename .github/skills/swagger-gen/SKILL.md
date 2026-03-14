---
name: swagger-gen
description: 'SwaggerドキュメントやOpenAPI定義を生成・更新する時に使用するSkill。「Swagger更新して」「make swagger実行して」「OpenAPI再生成して」「APIドキュメント更新して」などの操作が対象。アノテーション記述ルール・再生成フロー・フロントエンド型同期手順を含む。'
argument-hint: '例: "ユーザーAPIのSwaggerアノテーションを追加" / "make swaggerで再生成してフロントエンドに反映" / "レスポンス構造体を追加してSwagger更新"'
---

# Swagger/OpenAPI 生成 Skill

Swaggerアノテーション追加・`make swagger`での再生成・フロントエンドへの型自動同期までの全手順。

## 再生成フロー（全体）

```
1. models/ にレスポンス構造体を追加・修正
2. handlers/ でアノテーションと実装を修正
3. make swagger（または swag init）を実行
4. backend/docs/swagger.yaml が更新される
5. scripts/watch-openapi.ts が自動的にフロントエンドにコピー
6. Orval が自動実行されフロントエンドの型・API関数が再生成される
```

```bash
cd backend && make swagger
# または
cd backend && swag init -g cmd/main.go -o docs
```

---

## Swaggerアノテーション記述ルール

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

---

## 基本原則

- **実装とSwagger定義を一致させる**: ハンドラーの実際のレスポンス構造とSwaggerアノテーションの型定義は必ず一致させる
- **型定義を使用する**: `gin.H{}`で直接JSON構造を作るのではなく、`models`パッケージに構造体を定義して使用する
- **レスポンス構造体の命名**: `{Entity}Response`形式（例: `UsersResponse`, `PostsResponse`, `ErrorResponse`）

---

## レスポンス構造体の設計

❌ NG：実装とアノテーションが不一致
```go
// @Success 200 {array} models.User "ユーザー一覧"
func (h *UserHandler) GetAllUsers(c *gin.Context) {
    // 実際はオブジェクト（users, total）を返している
    c.JSON(http.StatusOK, gin.H{"users": users, "total": len(users)})
}
```

✅ OK：レスポンス構造体を定義して使用
```go
// models/user.go
type UsersResponse struct {
    Users []User `json:"users"`
    Total int    `json:"total"`
}

// handlers/user_handler.go
// @Success 200 {object} models.UsersResponse "ユーザー一覧と総数"
func (h *UserHandler) GetAllUsers(c *gin.Context) {
    response := models.UsersResponse{Users: users, Total: len(users)}
    c.JSON(http.StatusOK, response)
}
```

### 設計パターン

| パターン | 実装 |
|---|---|
| リスト系 | `Type[]Response` に配列と総数を含める |
| 単一エンティティ | 構造体を直接返す |
| エラー | `ErrorResponse{ Error, Code, Details }` を使用 |

---

## 完了チェックリスト

- [ ] レスポンス構造体を `models` パッケージに定義した
- [ ] ハンドラーの実装で構造体を使用している（`gin.H{}` を直接使っていない）
- [ ] Swaggerアノテーションの `@Success` 型が実装と一致している
- [ ] `swag init` を実行してエラーが出ないことを確認した
- [ ] 生成された `swagger.yaml` でレスポンス定義が正しいことを確認した
- [ ] フロントエンドの型（`frontend/api/model/`）が正しく再生成されたことを確認した
- [ ] `frontend/types/domain.ts` のエイリアスに影響がある場合は更新した
