.PHONY: swagger build run

# Swagger ドキュメント生成
swagger:
	swag init -g cmd/main.go --parseDependency --parseInternal -o docs

# ビルド
build:
	go build -o ./tmp/main ./cmd/main.go

# 実行
run:
	go run cmd/main.go

# 開発用（swagger生成 + 実行）
dev: swagger run
