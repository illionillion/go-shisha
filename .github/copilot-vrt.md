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

### VRT 実行コマンド
- ローカル実行: `pnpm storybook` を起動した後、`pnpm vrt` でVRTを実行する
- スナップショット更新: `pnpm vrt:update`（意図的なUI変更時のみ実行）
- スナップショットは `frontend/__image_snapshots__/` に保存され、差分は `__diff_output__` に出力される

### CI/CD 統合
- PR作成時に自動でVRTが実行される
- 差分が検出された場合、Artifactsに差分画像がアップロードされ、PRコメントで通知される

### 運用ルール
- スナップショットを更新した場合は必ず差分画像を目視で確認する
- PRではVRT関連の変更内容を明示する
- 詳細な運用手順や注意点は `frontend/README.md` の VRT セクションを参照する

### 実行方針: Docker コンテナでの実行を必須化

- 方針: CI（Pull Request含む）およびチーム運用での VRT 実行は、再現性確保のため「必ず Docker コンテナ上で行う」ことを必須とします。ローカルでの素早い確認は許容しますが、最終検証・CI実行はコンテナ実行を必須とします。
- 理由: ブラウザ／フォント／OS差に起因する非再現性を防止し、ローカルとCIの差異を最小化するため。
- 実装例:
  - CIワークフローはコミット固有の Docker イメージをビルドして、そのイメージでテストを実行する（PR向けは常にビルドする）。
  - ローカルで同じ環境を再現するための `pnpm` スクリプト（`vrt:build` / `vrt:run` 等）を用意することを推奨します。
