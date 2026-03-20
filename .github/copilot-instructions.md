# GitHub Copilot カスタムインストラクション

このドキュメントは、Go-Shisha（シーシャSNSアプリ）でGitHub Copilotがレビュー、コード生成を行う際に参照するためのカスタムインストラクションです。

## 共通基本ルール

1. **応答言語**: 質問への回答は常に日本語で行ってください。
2. **確認メッセージ**: ルールを参照したことを示すため、回答の冒頭に「ルールを参照しました！」と表示してください。
3. **領域別ルールの必須参照**: 作業開始前に、対象領域のルールファイルを**必ず**参照する。Frontend作業→`instructions/frontend.instructions.md`、Backend作業→`instructions/backend.instructions.md`、レビュー→`instructions/review.instructions.md`、VRT実行→`skills/vrt-run/SKILL.md`、Git/GitHub操作→`skills/github-ops/SKILL.md`、脆弱性対応→`skills/vuln-fix/SKILL.md`。参照したファイル名を確認メッセージに明記する（例: "frontend.instructions.md のルールを参照しました！"）
4. **推論・想像の禁止**: 推論や想像で作業しない。事実に基づいて作業する。不明な点は確認を求める。
5. **テスト実行の効率化と検証**: 変更したファイルがある場合、まずテスト内容が修正内容を正しく検証できるかを確認してから、全体実行ではなく単体で実行して時間を省略する。必要に応じてテストケースを追加してから実行する
6. **ルール管理**: 重要なベストプラクティスを発見した際は、基本ルールへの昇格も検討し、動的ルールセクションまたは基本ルールへの追加を提案する
7. **設定ファイルの動作確認**: Linter設定、ビルド設定、CI設定等の設定ファイルを作成・変更した場合、必ず実行して動作確認してからコミットする。動作しない設定をコミットしてはならない
8. **拡張可能な設計・データモデリング**: データモデルはオプションフィールドを活用し、将来的拡張を見据えた設計にする。Backendのクリーンアーキテクチャを遵守し、レイヤー間依存を最小化。Frontend/Backend間で型定義を共有し、API変更時の影響を抑える。

## 本ドキュメントの役割と参照先

このファイルは「共通基本ルール」を唯一のソースとして管理します。領域別のルールとオンデマンドのワークフローは以下に分割しています。

### `.github/instructions/`（ファイル編集時に自動ロード）
- `backend.instructions.md` : Backend 固有ルール（Go、ビルド・テスト・DI 等） — `backend/**` に自動適用
- `frontend.instructions.md` : Frontend 固有ルール（TypeScript、Storybook、コンポーネント設計） — `frontend/**` に自動適用
- `review.instructions.md` : PR / レビュー関連ルール（バッジ、レビュー方針など） — 全ファイルに適用

### `.github/skills/`（ユーザーが明示的に指示した時のみ実行）
- `github-ops/` : Issue作成・PR作成・コミット・ghコマンド操作の手順
- `vrt-run/` : VRT実行・スナップショット更新手順
- `swagger-gen/` : Swagger/OpenAPI の再生成手順
- `vuln-fix/` : pnpm audit 脆弱性対応・バージョンアップ・overrides設定・PR作成の手順

## ディレクトリ構造の理解

### Frontend (`/frontend`)
- **bulletproof-react構造**を参考にした設計
- `/app` - Next.js App Routerのルーティング  
- `/components` - 再利用可能なUIコンポーネント、共通的なものを配置
- `/features` - 機能ごとのディレクトリ（各機能は独立しており、components・hooks・stories・types・testsを含む）
- `/lib` - ユーティリティ関数、hooks
- `/types` - 共通型定義
- `/api` - Orval自動生成APIクライアント
- `/openapi` - OpenAPI定義（backendから自動コピー）
- **VRT環境**: `compose.vrt.yml`、`Dockerfile.vrt`（frontend配下に配置）

### Backend (`/backend`)
- **クリーンアーキテクチャ**で設計
- `/cmd` - エントリポイント（main.go）
- `/internal` - アプリケーションコード
  - `/handlers` - HTTPハンドラー（Controller層）
  - `/services` - ビジネスロジック（UseCase層）
  - `/repositories` - データアクセス層（Repository層）
  - `/models` - エンティティ・ドメインモデル
  - `/middleware` - ミドルウェア
- `/pkg` - 外部パッケージ、共通ライブラリ
- `/docs` - Swagger自動生成定義
- 依存性注入を使用して各層の疎結合を実現

### Root
- **モノレポ管理**: pnpm-workspaces
- `/scripts` - 自動化スクリプト（OpenAPI自動コピー等）
- **Git Hooks**: lefthook（pre-commit: lint-staged、commit-msg: commitlint）
- **共有**: `/shared`（型定義・設定ファイル）※今後追加予定

## 技術スタック

### Frontend
- **アーキテクチャ**: bulletproof-react
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: TanStack Query + Zustand
- **テスト**: Vitest + Testing Library + Playwright
- **コンポーネント**: Storybook + oval

### Backend  
- **アーキテクチャ**: クリーンアーキテクチャ
- **言語**: Go 1.21+
- **フレームワーク**: Gin
- **データベース**: PostgreSQL + GORM
- **認証**: JWT
- **テスト**: 標準testing + testify
- **依存性注入**: wire (google/wire)

## 開発フロー

1. 該当Issueに「着手開始」コメントを記載（Issue作成時は適切なラベルを必ず紐づける）
2. `main`ブランチから新しいブランチを作成、変更内容が分かる命名（`ラベル/issue番号-内容`）にする
3. 開発作業を実施
   - 基本ルールに従ってコード品質と型安全性を保つ
   - bulletproof-react（Frontend）、クリーンアーキテクチャ（Backend）の設計原則に従う
   - Backendで型定義変更時は`make swagger`でSwagger再生成（OpenAPI自動コピー→Orval自動生成が動作）
4. 動作確認・セルフレビューの実施
   - テストを実行し、すべてのテストが通ることを確認する
   - lefthookのpre-commitでlint/formatが自動実行される
5. Pull Requestの作成
   - タイトル: 変更内容を簡潔に表現（プレフィックス不要）
   - 説明文: プロジェクトのテンプレートに従う
   - Commit Message: 基本ルール4に従い日本語でConventional Commits形式を使用（commitlintで検証）
   - `Closes #issue番号`を書く
   - ラベル: 該当するラベル（feature、bug、docs等）を必ず紐づける
6. レビューを受ける
7. 修正が必要な場合は対応する
8. 1つ以上のApproveを得たらマージ
9. IssueをCloseする

## 型安全性・コード品質

- **型定義の共有**: Frontend/Backend間で共有する型は/sharedに配置
- **エラーハンドリング**: 明示的なエラー処理、適切なHTTPステータス返却
- **バリデーション**: 入力値検証をHandler層で実施、sanitization実装

### 生成型の再エクスポート運用

- 生成した型をそのままコンポーネントやフックで直接使わず、`/frontend/api` の自動生成型は `frontend/types/domain.ts`（または `frontend/types` 配下での再エクスポート）で再エクスポートした型を利用すること。これにより実装側の依存を局所化し、将来的な生成型の変化を吸収しやすくします。
- バックエンドの OpenAPI / スキーマが更新された際は、必ず `frontend/types/domain.ts` のエイリアスや必要な調整箇所を見直してください。生成型の名前や構造が変わった場合は、まず `domain.ts` 側で互換層を作り（エイリアスや変換関数）、影響範囲を限定してからコンポーネント側の修正を行います。
- CI による検出: 将来的には OpenAPI 差分チェックや CI 上での検出ルールを追加し、生成型の破壊的な変更があった場合に自動で通知/失敗させる運用を検討してください。
- 例外: `frontend/api`（生成コード）、`frontend/services`、`frontend/lib/adapters` 内では直接生成型を扱って差し支えありません（ここが変換/適応レイヤーになるため）。

## 自動ルール管理

このセクションは、開発中に発見されたベストプラクティスや注意点を自動的に蓄積する機能です。

### 仕組み
- レビューコメントや開発中に発見された重要なルールが自動的に記録される
- ルールは具体的で再現可能な形で記述される  
- 日付と関連コンテキストが併記される

<!-- AUTO_RULES_START -->
<!-- 今後、重要なルールやベストプラクティスが自動で追加されます -->
<!-- AUTO_RULES_END -->
