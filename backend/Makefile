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
.PHONY: fmt imports lint lint-fix install-golangci install-goimports install-tools

fmt:
	gofmt -w .

imports:
	@if command -v goimports >/dev/null 2>&1; then \
		goimports -w .; \
	else \
		echo "goimports not found, skipping"; \
	fi

install-golangci:
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b ./bin latest

install-goimports:
	@echo "Installing goimports..."
	@GO_BIN=$$(go env GOBIN || echo $$(go env GOPATH)/bin) ; \
	if command -v go >/dev/null 2>&1; then \
		go install golang.org/x/tools/cmd/goimports@latest && echo "goimports installed to $$GOBIN" || echo "failed to install goimports" ; \
	else \
		echo "go not found" ; \
	fi

install-tools: install-goimports install-golangci
	@echo "Tools installed"

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

# Run all backend formatting/lint fixes (installs tools if missing)
.PHONY: fix-all
fix-all: install-tools imports fmt lint-fix
	@echo "Backend formatting and lint fixes complete"
