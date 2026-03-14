---
name: vrt-run
description: 'VRT（Visual Regression Testing）を実行・更新する時に使用するSkill。「VRT実行して」「スナップショット更新して」「VRT確認して」「VRTをDockerで実行して」などの操作が対象。ローカル実行とDocker必須実行の手順を含む。'
argument-hint: '例: "VRT実行してスナップショットを確認" / "UI変更したのでスナップショット更新" / "Dockerで最終VRT検証"'
---

# VRT (Visual Regression Testing) 実行 Skill

VRTの実行・スナップショット更新・CI確認など、VRTテストを動かす全手順。

## ローカル実行（素早い確認用）

```bash
# 1. Storybookを起動
pnpm storybook

# 2. VRTを実行（別ターミナルで）
pnpm vrt
```

スナップショットは `frontend/__image_snapshots__/` に保存される。  
差分は `__diff_output__/` に出力される（`.gitignore` で除外済み）。

---

## スナップショット更新（意図的なUI変更時のみ）

```bash
pnpm vrt:update
```

⚠️ **必ず差分画像を目視で確認してから更新すること。**  
意図しないUI変更が含まれていないか確認する。

---

## Docker コンテナでの実行（CI・最終検証は必須）

ブラウザ/フォント/OS差による非再現性を防ぐため、CI・チーム確認時はコンテナ実行が**必須**。

```bash
# VRT用Dockerイメージをビルド
pnpm vrt:build

# コンテナ実行
pnpm vrt:run
```

設定は `frontend/compose.vrt.yml` / `frontend/Dockerfile.vrt` を参照。

### 実行設定
- ビューポート: 1280x800（PC）
- SPテスト: `tags: ['vrt-sp']` が付いたstoryが対象
- カラースキーム: light
- `postVisit`: `page.waitForLoadState('networkidle')` を使用
- 画像比較許容: `failureThreshold: 0.01`（フォント・AA差分対策）

---

## CI/CD

- PRを作成すると自動でVRTが実行される
- 差分が検出された場合 → Artifactsに差分画像がアップロードされPRコメントで通知

---

## PRでのVRT関連記載

VRT関連の変更がある場合、PRの本文にVRT結果・スナップショット更新の有無を明示する。
