.PHONY: swagger build run test

# Swagger ドキュメント生成
swagger:
	swag init -g cmd/main.go --parseDependency --parseInternal -o docs

# ビルド
build:
	go build -o ./tmp/main ./cmd/main.go

# 実行
run:
	go run cmd/main.go

# テスト
test:
	go test ./... -v

# 開発用（swagger生成 + 実行）

# ホットリロード用（swagger生成→ビルド→実行）
reload:
	make swagger
	make build
	./tmp/main
