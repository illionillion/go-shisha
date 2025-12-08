# Copilot — VRT ルール

このファイルを参照した場合、回答冒頭に「copilot-vrt.md のルールを参照しました！」と表示してください。

Visual Regression Testing (VRT) に関する運用ルールとベストプラクティス。

## Storybook タグ付け
- 視覚的に重要な story に `tags: ['vrt']` を付ける。
- 小さな汎用UIは親コンポーネントでカバーされていれば個別タグ不要。

## スナップショット運用
- スナップショットは `frontend/__image_snapshots__/` を使い、CI での比較を行う。
- 差分は `__diff_output__` に出力し、`.gitignore` で除外する。

## テストランナー設定（例）
- ビューポート: 1280x800
- カラースキーム: light
- `postVisit` に `page.waitForLoadState('networkidle')` を入れる。
- 画像比較は `failureThreshold: 0.01` 程度の許容を設定する（フォントやAA差分対策）。
