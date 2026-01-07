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

# 開発用（swagger生成 + airでホットリロード実行）
dev:
	make swagger
	air 

# Formatting and linting
.PHONY: fmt imports lint lint-fix install-golangci

fmt:
	gofmt -w .

imports:
	@command -v goimports >/dev/null 2>&1 || { echo "goimports not found, skipping"; exit 0; }
	goimports -w .

install-golangci:
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b ./bin latest

lint:
	@if [ -x ./bin/golangci-lint ]; then \
		./bin/golangci-lint run ./... ; \
	else \
		command -v golangci-lint >/dev/null 2>&1 && golangci-lint run ./... || echo "golangci-lint not found, run make install-golangci"; \
	fi

lint-fix:
	@if [ -x ./bin/golangci-lint ]; then \
		./bin/golangci-lint run --fix ./... ; \
	else \
		command -v golangci-lint >/dev/null 2>&1 && golangci-lint run --fix ./... || echo "golangci-lint not found, run make install-golangci"; \
	fi
