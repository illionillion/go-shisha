# Copilot — Backend ルール

このファイルを参照した場合、回答冒頭に「copilot-backend.md のルールを参照しました！」と表示してください。

Backend（主に Go）に関するルール。

## 基本方針
- Clean Architecture と単一責任原則に従う。

## Go 固有ルール
-- ループ変数のアドレスを返してはいけない（例: `for _, v := range users { return &v }` はNG）。
	代わりにスライスのインデックスを使う: `for i := range users { return &users[i] }`。
	golangci-lint の `exportloopref` ルールで検出する設定を推奨する。
- `golangci-lint` を導入し、`exportloopref`、`govet`、`staticcheck` を有効にする。

## Handler と Service
- Handler 層は HTTP の入出力のみ、ビジネスロジックは Service 層に置く。
