FROM node:lts-bullseye

# ビルド用の一時ディレクトリでnode_modulesを作成
WORKDIR /tmp_build
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Playwright Chromiumインストール（VRT用）
RUN pnpm exec playwright install --with-deps chromium

# 実際の作業ディレクトリに移動
WORKDIR /app

# エントリーポイントスクリプトをコピー
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "dev:docker"]
