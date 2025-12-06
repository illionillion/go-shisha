# GitHub Copilot カスタムインストラクション

このドキュメントは、Go-Shisha（シーシャSNSアプリ）でGitHub Copilotがレビュー、コード生成を行う際に参照するためのカスタムインストラクションです。

## 共通基本ルール

1. **応答言語**: 質問への回答は常に日本語で行ってください。
2. **確認メッセージ**: ルールを参照したことを示すため、回答の冒頭に「ルールを参照しました！」と表示してください。
3. **推論・想像の禁止**: 推論や想像で作業しない。事実に基づいて作業する。不明な点は確認を求める。
4. **コミットメッセージ言語**: コミットメッセージはConventional Commitsに従い日本語で記述する。type: 日本語説明の形式を使用する（例: `feat: 投稿作成機能を追加`, `fix: API認証エラーを修正`）
5. **テスト実行の効率化と検証**: 変更したファイルがある場合、まずテスト内容が修正内容を正しく検証できるかを確認してから、全体実行ではなく単体で実行して時間を省略する。必要に応じてテストケースを追加してから実行する
6. **Issue・PR内容のCLI確認徹底**: IssueやPRの内容・コメントを確認する際は、GitHubのWebページではなく必ずghコマンド（CLI）で確認する。作業効率・履歴管理のためWeb UIは原則使用しない。
7. **PRレビューコメント確認**: PR上でCopilotのレビューを確認する際は`gh api url/comments`でコメントを確認し、GitHubのWeb UIではなくCLIで効率的に対応する
8. **コミット粒度の細分化**: 複数ファイルをまとめてaddしてコミットするのではなく、論理的に関連する変更ごとに小分けしてコミットする。1つのコミットは1つの明確な目的を持つようにし、レビューしやすい粒度に保つ。具体的には `git add 特定ファイル` → `git commit` を繰り返し、一度に複数の無関係な変更をコミットしない
9. **ラベル付与の徹底**: IssueやPR作成時は必ず適切なラベルを紐づける。ラベルにより作業の種類（feature、bug、docs等）や優先度が明確になり、プロジェクト管理が効率化される
10. **PR作成の最適化**: テンプレートに従いつつ、Copilotがレビューしやすいよう重点レビュー箇所を明記する。変更の意図・影響範囲・テスト方針を具体的に記載し、レビュー効率を向上させる
11. **ルール管理**: 重要なベストプラクティスを発見した際は、基本ルールへの昇格も検討し、動的ルールセクションまたは基本ルールへの追加を提案する
12. **操作前の確認徹底**: gitコマンド（add、commit、push）やファイル削除、データベース操作など後戻りが困難な操作を実行する前は、必ずユーザーに内容と影響を説明して明示的な許可を求める。勝手に実行してはならない
13. **GitHub投稿時の署名**: ghコマンドでIssueやPRにコメントを投稿する際は、コメント末尾に必ず「*-- by Copilot*」の署名を追加する。ユーザーとCopilotの投稿を明確に区別するため
14. **設定ファイルの動作確認**: Linter設定、ビルド設定、CI設定等の設定ファイルを作成・変更した場合、必ず実行して動作確認してからコミットする。動作しない設定をコミットしてはならない
15. **コミット前の変更確認**: コミット前に必ず`git status`で変更ファイルを確認し、漏れがないかチェックする。意図しないファイルの除外やステージング忘れを防ぐ

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

## Frontend基本ルール

1. **コード品質の基本**: ファイル冒頭のimport文セクションに機能修正のコードを混在させない、配列などの`{}`の開始終了を明確にする、ソースコードが壊れないように注意する
2. **型安全性の徹底**: any禁止、型安全に実装する
3. **コメント記述規則**:
   - **Frontend（TypeScript/JavaScript）**: 関数と定数にコメントを書く場合は必ずJSDoc形式`/**...*/`を使用する。詳細な説明・例・制約を記載する
   - **例外**: JSX内のコメントは`{/* ... */}`形式を許可する。ただし、可能であればコンポーネント外に通常のコメント`//`で記述することを推奨する
4. **Frontend変更時のLint・型チェック・フォーマット確認**: Frontend（TypeScript/Next.js）のコードを変更した場合、まず`pnpm fix`で自動修正を試み、失敗した場合のみ`pnpm check`で詳細調査する。時間効率を優先しつつ、CIで検出されるエラーをローカルで事前に防ぐ
5. **コンポーネント作成ルール**:
   - **CVA（class-variance-authority）使用**: バリアント管理が必要なコンポーネントはCVAを使用し、型安全にスタイルを管理する
   - **clsx使用**: クラス名は`clsx`で配列形式で記述する。各クラスを配列要素として分割し、可読性を向上させる
   - **配列形式の徹底**: CVAのベースクラス・バリアントクラス、通常のclassNameすべてで配列形式を使用する
   - **例**:
     ```tsx
     // CVA定義
     const cardVariants = cva(
       ["rounded-lg", "overflow-hidden", "bg-white"],
       {
         variants: {
           size: {
             sm: ["w-32", "h-32"],
             lg: ["w-64", "h-64"],
           },
         },
       }
     );
     
     // コンポーネント内
     <div className={clsx([cardVariants({ size }), "追加クラス"])}>
       <span className={clsx(["text-sm", "font-bold"])}>テキスト</span>
     </div>
     ```
   - **静的クラスのみの場合**: CVAやclsxを使わず通常のclassNameでも可。ただし、将来的に条件分岐が予想される場合はclsx配列形式を推奨

## Backend基本ルール

1. **コメント記述規則**:
   - **Backend（Go）**: godoc標準の`//`形式を使用する。Swaggoアノテーションも`//`形式で記述する。JSDoc形式は使用しない
2. **Backend変更時のビルド・Lint・テスト確認**: Backend（Go）のコードを変更した場合、プッシュ前に必ず`go build`または`make build`でビルドが通ること、`go test ./...`でテストが全て通ること、さらに`./backend/bin/golangci-lint run ./backend/...`でlinterも通ることを確認する。ビルド・Lint・テストエラーをリモートに持ち込まない。将来的にはCI/CDで自動化予定

## ディレクトリ構造の理解

### Frontend (`/frontend`)
- **bulletproof-react構造**を参考にした設計
- `/app` - Next.js App Routerのルーティング  
- `/components` - 再利用可能なUIコンポーネント、共通的なものを配置
- `/features` - 機能ごとのディレクトリ（各機能は独立しており、components・hooks・stories・types・testsを含む）
- `/lib` - ユーティリティ関数、hooks
- `/types` - 共通型定義

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
- 依存性注入を使用して各層の疎結合を実現

### 共有 (`/shared`)
- 型定義・設定ファイル
- API仕様（OpenAPI/Swagger）
- 定数定義

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
4. 動作確認・セルフレビューの実施
   - テストを実行し、すべてのテストが通ることを確認する
5. Pull Requestの作成
   - タイトル: 変更内容を簡潔に表現（プレフィックス不要）
   - 説明文: プロジェクトのテンプレートに従う
   - Commit Message: 基本ルール4に従い日本語でConventional Commits形式を使用
   - `Closes #issue番号`を書く
   - ラベル: 該当するラベル（feature、bug、docs等）を必ず紐づける
6. レビューを受ける
7. 修正が必要な場合は対応する
8. 1つ以上のApproveを得たらマージ
9. IssueをCloseする

## 自動ルール管理

このセクションは、開発中に発見されたベストプラクティスや注意点を自動的に蓄積する機能です。

### 仕組み
- レビューコメントや開発中に発見された重要なルールが自動的に記録される
- ルールは具体的で再現可能な形で記述される  
- 日付と関連コンテキストが併記される

### 動的ルール

#### Frontend設計（bulletproof-react）
- **機能分割の徹底**: 各featureは独立したコンポーネント・hooks・types・testsを持つ
- **layered folder structure**: components（UI）、hooks（ロジック）、types（型）、api（通信）の分離
- **共通コンポーネント**: /componentsは本当に再利用される汎用的なもののみ配置
- **feature間の依存**: 他のfeatureを直接importしない、共通の場合は/componentsや/libに移動

#### Backend設計（クリーンアーキテクチャ）
- **依存関係ルール**: 外側の層は内側の層に依存できるが、内側は外側に依存しない
- **Handler層**: HTTPリクエスト・レスポンスの処理のみ、ビジネスロジックは含まない
- **Service層**: ビジネスルールの実装、Repositoryインターフェースに依存
- **Repository層**: データアクセスの実装、ドメインモデルを返す
  - **単一責任原則**: 各Repositoryは自身のエンティティのみを扱う
  - ❌ NG: `UserRepository`で`Post`データを取得
  - ✅ OK: `UserRepository`は`User`のみ、`PostRepository`は`Post`のみ
  - クロスエンティティ取得はService層で複数Repositoryを組み合わせる
- **依存性注入**: wireを使用してDIコンテナを構築、テスト時のモック差し替えを容易にする

#### 型安全性・コード品質
- **型定義の共有**: Frontend/Backend間で共有する型は/sharedに配置
- **エラーハンドリング**: 明示的なエラー処理、適切なHTTPステータス返却
- **バリデーション**: 入力値検証をHandler層で実施、sanitization実装

#### Go言語固有のベストプラクティス
- **ループ変数のポインタ**: `for _, item := range`で`&item`を返してはいけない
  - ❌ NG: `for _, user := range users { return &user }` （ループ変数のアドレスは使い回される）
  - ✅ OK: `for i := range users { return &users[i] }` （スライス要素の正しいアドレス）
  - golangci-lintの`exportloopref`ルールで検出可能
- **Linter**: golangci-lintを使用し、`exportloopref`、`govet`、`staticcheck`を有効化

<!-- AUTO_RULES_START -->
<!-- 今後、重要なルールやベストプラクティスが自動で追加されます -->
<!-- AUTO_RULES_END -->
