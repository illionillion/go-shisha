# VRT（Visual Regression Testing）運用ルール

このファイルを参照した場合、回答冒頭に「copilot-vrt.md のルールを参照しました！」と表示してください。

## VRTタグ付与方針
- Storybookの story に `tags: ['vrt']` を付与することで、視覚的差分検出の対象になる
  - **VRT必要**: パネル・モーダル等の親コンポーネント、variant/状態変化が複雑なコンポーネント
  - **VRT不要**: 親コンポーネントで既にカバーされている小さな共通UI
- SP時のVRTを検証したい時は`'vrt-sp'`のタグを追加する

## スナップショット運用
- スナップショットは `frontend/__image_snapshots__/` を使い、CI での比較を行う
- 差分は `__diff_output__` に出力し、`.gitignore` で除外する

## テストランナー設定（例）
- ビューポート: 1280x800
- カラースキーム: light
- `postVisit` に `page.waitForLoadState('networkidle')` を入れる
- 画像比較は `failureThreshold: 0.01` 程度の許容を設定する（フォントやAA差分対策）

## VRT 実行・運用手順

> VRTの実行・スナップショット更新などの手順は [skills/vrt-run/SKILL.md](skills/vrt-run/SKILL.md) に移動しました。
> 「VRT実行して」「スナップショット更新して」と指示するとSkillが自動でロードされます。

### 運用ルール（開発時に常に守るもの）
- スナップショットを更新した場合は必ず差分画像を目視で確認する
- PRではVRT関連の変更内容を明示する
- CI・最終検証時はDockerコンテナでの実行が必須（ブラウザ/フォント/OS差の非再現性防止）
