# ---- builder: 本番用バイナリをコンパイル ----
FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git
# swag インストール（Swagger docs 生成に必要）
RUN GOBIN=/usr/local/bin go install github.com/swaggo/swag/cmd/swag@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Swagger docs を生成してからビルド
RUN swag init -g cmd/main.go --parseDependency --parseInternal -o docs

RUN mkdir -p tmp
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o ./tmp/main ./cmd/main.go


# ---- dev: 開発用（air + swag によるホットリロード） ----
FROM golang:1.25-alpine AS dev

WORKDIR /app

RUN apk add --no-cache git curl make

# airインストール（公式移行先）
RUN go install github.com/air-verse/air@v1.63.4
# swagインストール（GOBIN指定でパスを明示）
RUN GOBIN=/usr/local/bin go install github.com/swaggo/swag/cmd/swag@latest

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

COPY .air.toml .

CMD ["make", "dev"]


# ---- prod: 軽量本番イメージ（ECS Fargate 用） ----
FROM alpine:3.20 AS prod

RUN apk add --no-cache ca-certificates tzdata

# 非rootユーザーで起動
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/tmp/main ./main
COPY --from=builder /app/db/migrations ./db/migrations

USER appuser

EXPOSE 8080

CMD ["./main"]
