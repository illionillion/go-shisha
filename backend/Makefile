.PHONY: swagger build run

# Swagger ドキュメント生成
swagger:
	swag init -g cmd/main.go --parseDependency --parseInternal -o docs

# ビルド
build:
	go build -o ./tmp/main ./cmd/main.go

# 実行
run: build
	./tmp/main

# 開発用（swagger生成 + ビルド + 実行）
dev: swagger build run
