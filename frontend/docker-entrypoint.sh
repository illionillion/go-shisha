#!/bin/sh
set -e

# node_modulesの存在チェック（より確実に）
if [ ! -f "/app/node_modules/.pnpm/lock.yaml" ] || [ ! -d "/app/node_modules/.bin" ]; then
  echo "Copying node_modules to host..."
  rm -rf /app/node_modules
  cp -r /tmp_build/node_modules /app/
  echo "Copy completed."
fi

exec "$@"
