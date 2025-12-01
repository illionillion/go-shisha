FROM golang:1.25-alpine

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
