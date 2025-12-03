#!/bin/sh
# backend/openapi/openapi.yml を frontend/openapi/openapi.yml にコピーするスクリプト

set -e

SRC="$(dirname "$0")/../backend/docs/swagger.yaml"
DST="$(dirname "$0")/../frontend/openapi/openapi.yml"

if [ ! -f "$SRC" ]; then
  echo "[ERROR] backend/docs/swagger.yaml が存在しません。"
  exit 1
fi

mkdir -p "$(dirname "$DST")"
cp "$SRC" "$DST"
echo "[OK] swagger.yaml を frontend/openapi/openapi.yml にコピーしました。"