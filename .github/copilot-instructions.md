# GitHub Copilot カスタムインストラクション

このドキュメントは、Go-Shisha（シーシャSNSアプリ）でGitHub Copilotがレビュー、コード生成を行う際に参照するためのカスタムインストラクションです。

## 共通基本ルール

1. **応答言語**: 質問への回答は常に日本語で行ってください。
2. **確認メッセージ**: ルールを参照したことを示すため、回答の冒頭に「ルールを参照しました！」と表示してください。
3. **領域別ルールの必須参照**: 作業開始前に、対象領域のルールファイルを**必ず**参照する。Frontend作業→copilot-frontend.md、Backend作業→copilot-backend.md、レビュー→copilot-review.md、VRT→copilot-vrt.mdを読んでから作業開始。参照したファイル名を確認メッセージに明記する（例: "copilot-frontend.md のルールを参照しました！"）
4. **推論・想像の禁止**: 推論や想像で作業しない。事実に基づいて作業する。不明な点は確認を求める。
5. **テスト実行の効率化と検証**: 変更したファイルがある場合、まずテスト内容が修正内容を正しく検証できるかを確認してから、全体実行ではなく単体で実行して時間を省略する。必要に応じてテストケースを追加してから実行する
6. **ルール管理**: 重要なベストプラクティスを発見した際は、基本ルールへの昇格も検討し、動的ルールセクションまたは基本ルールへの追加を提案する
7. **設定ファイルの動作確認**: Linter設定、ビルド設定、CI設定等の設定ファイルを作成・変更した場合、必ず実行して動作確認してからコミットする。動作しない設定をコミットしてはならない
8. **拡張可能な設計・データモデリング**: データモデルはオプションフィールドを活用し、将来的拡張を見据えた設計にする。Backendのクリーンアーキテクチャを遵守し、レイヤー間依存を最小化。Frontend/Backend間で型定義を共有し、API変更時の影響を抑える。

## Copilot による Git・GitHub CLI 操作ルール

Copilot が`git`・`gh` CLI を使ってコミット Issue/PR の作成・編集・コメント投稿を行う際に守る運用ルールをまとめます。自動化やスクリプトでの実行時は以下を必須チェックとして実装してください。

- **ラベル確認**: PR/Issue 作成前に `gh label list` で必要なラベルが存在することを確認する。存在しない場合は `gh label create <name> --color <hex>` で作成するか、リポジトリ管理者へ追加を依頼すること。
- **本文の扱い**: コマンドライン引数に `\n` を埋め込まず、実際の改行を含むファイルを作成して `gh pr create --body-file .github/DRAFTS/<branch>-pr.md`（または heredoc）で渡すこと。これによりシェル解釈や文字化けを防ぐ。
- **実行手順（必須）**: 自動化/スクリプトは次の順で実行すること — (1) ラベル確認 → (2) 本文ファイル生成 → (3) `gh pr create --body-file` 実行。
- **Issue テンプレート順守**: Issue 作成時は `.github/ISSUE_TEMPLATE` の該当テンプレートを読み込み、全項目を埋めて作成すること（CLI 経由でも必ず反映する）。
- **Issue・PR内容のCLI確認徹底**: IssueやPRの内容・コメントを確認する際は、GitHubのWebページではなく必ずghコマンド（CLI）で確認する。作業効率・履歴管理のためWeb UIは原則使用しない。
- **PR作成の最適化**: テンプレートに従いつつ、Copilotがレビューしやすいよう重点レビュー箇所を明記する。変更の意図・影響範囲・テスト方針を具体的に記載し、レビュー効率を向上させる
- **PRレビューコメント確認**: PR上でCopilotのレビューを確認する際は`gh api url/comments`でコメントを確認し、GitHubのWeb UIではなくCLIで効率的に対応する
- **GitHub投稿時の署名**: ghコマンドでIssueやPRにコメントを投稿する際は、コメント末尾に必ず「*-- by Copilot*」の署名を追加する。ユーザーとCopilotの投稿を明確に区別するため
- **コミット前の変更確認**: コミット前に必ず`git status`で変更ファイルを確認し、漏れがないかチェックする。意図しないファイルの除外やステージング忘れを防ぐ
- **コミット・操作前確認**: `git add`/`commit`/`push` やファイル削除、データベース操作など戻せない操作は、実行前にユーザーへ内容と影響を説明し明示的な許可を得ること。
- **コミットメッセージ**: コミットメッセージはConventional Commitsに従い日本語で記述する。type: 日本語説明の形式を使用する（例: `feat: 投稿作成機能を追加`, `fix: API認証エラーを修正`）。
- **コミット粒度の細分化**: 複数ファイルをまとめてaddしてコミットするのではなく、論理的に関連する変更ごとに小分けしてコミットする。1つのコミットは1つの明確な目的を持つようにし、レビューしやすい粒度に保つ。具体的には `git add 特定ファイル` → `git commit` を繰り返し、一度に複数の無関係な変更をコミットしない
- **CLIコメント改行**: `gh` の `--body` を使う場合は `\n` ではなく実際の改行を含むファイルを使う（`--body-file` を推奨）。

## 本ドキュメントの役割と参照先

このファイルは「共通基本ルール」を主要なソースとして残します。プロジェクト内の領域別ルールは以下のファイルに分割しています。各ファイルは先頭に「参照確認メッセージ」の指示を含んでいます。

- `copilot-review.md` : PR / レビュー関連ルール（バッジ、レビュー方針など）
- `copilot-frontend.md` : Frontend 固有ルール（TypeScript、Storybook、コンポーネント設計）
- `copilot-backend.md` : Backend 固有ルール（Go、ビルド・テスト・DI 等）
- `copilot-vrt.md` : VRT（Visual Regression Testing）運用ルール

運用ルール:
- トップの共通ルールは唯一の「共通ソース」です。領域別ファイルは補足・運用手順を持ち、重複は避けてください。
- 各領域ファイルを参照したら、そのファイル名を明示した確認メッセージを回答冒頭に出すことをルール化します（例: `copilot-frontend.md のルールを参照しました！`）。

## Copilotレビュー時の基本ルール

1. **コメントの重要度バッジ**: レビューコメントには必ず以下のバッジを付ける
   - ![must](https://img.shields.io/badge/review-MUST-red.svg) - 必ず修正が必要（バグ、セキュリティリスク、重大な設計ミス）
   - ![should](https://img.shields.io/badge/review-SHOULD-orange.svg) - 修正を強く推奨（パフォーマンス、保守性、ベストプラクティス違反）
   - ![imo](https://img.shields.io/badge/review-IMO-yellowgreen.svg) - 提案・意見（好み、代替案、改善の余地）
   - ![ask](https://img.shields.io/badge/review-ASK-yellow.svg) - 選択肢の提示・方針確認（複数の実装案がある場合）
   - ![question](https://img.shields.io/badge/review-QUESTION-blue.svg) - 質問・確認事項（意図を理解したい場合）
   - ![nits](https://img.shields.io/badge/review-NITS-lightgrey.svg) - 些細な指摘（タイポ、フォーマット、コメント）
   
   参考: [Shields.io](https://shields.io/) でカスタムバッジを作成可能。状況に応じて適切なバッジを使い分けること

2. **コンテキストを踏まえたレビュー**: diffだけでなく、関連ファイル全体を読み、変更の意図・影響範囲を理解してからレビューする。部分的な理解で不適切な指摘をしない

3. **PR内の一貫性確保**: 同一PR内の既存レビューコメントを`gh pr view <PR番号> --comments`で確認し、矛盾や重複を避ける。修正済みの箇所に対して逆の指摘をしない

4. **建設的なフィードバック**: 問題を指摘するだけでなく、具体的な修正案やコード例を提示する。「なぜそうすべきか」の理由も説明する

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

## 自動ルール管理

このセクションは、開発中に発見されたベストプラクティスや注意点を自動的に蓄積する機能です。

### 仕組み
- レビューコメントや開発中に発見された重要なルールが自動的に記録される
- ルールは具体的で再現可能な形で記述される  
- 日付と関連コンテキストが併記される

<!-- AUTO_RULES_START -->
<!-- 今後、重要なルールやベストプラクティスが自動で追加されます -->
<!-- AUTO_RULES_END -->
