FROM node:lts-alpine

# ビルド用の一時ディレクトリでnode_modulesを作成
WORKDIR /tmp_build
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 実際の作業ディレクトリに移動
WORKDIR /app

# エントリーポイントスクリプト：ホスト側にnode_modulesがなければコピー
RUN cat > /entrypoint.sh <<'EOF'
#!/bin/sh
if [ ! -d "/app/node_modules/.bin" ]; then
  echo "Copying node_modules to host..."
  cp -r /tmp_build/node_modules /app/
fi
exec "$@"
EOF

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "dev:docker"]
