# Frontend 固有ルール

このファイルを参照した場合、回答冒頭に「copilot-frontend.md のルールを参照しました！」と表示してください。

## コード品質の基本
- ファイル冒頭のimport文セクションに機能修正のコードを混在させない
- 配列などの`{}`の開始終了を明確にする
- ソースコードが壊れないように注意する

## 型安全性の徹底
- any禁止、型安全に実装する

## コメント記述規則
- **Frontend（TypeScript/JavaScript）**: 関数と定数にコメントを書く場合は必ずJSDoc形式`/**...*/`を使用する。詳細な説明・例・制約を記載する
- **例外**: JSX内のコメントは`{/* ... */}`形式を許可する。ただし、可能であればコンポーネント外に通常のコメント`//`で記述することを推奨する

## Frontend変更時のチェック手順
- Frontend（TypeScript/Next.js）のコードを変更した場合、まず`pnpm fix`で自動修正を試みる。
- `pnpm fix`は自動修正機能により大半の問題を瞬時に解決できるため時間効率が高い。
- 失敗した場合のみ`pnpm check`で詳細調査する。`pnpm check`は詳細なエラー情報を提供するが実行に時間がかかるため、fixで解決できない問題がある場合のみ使用する。
- CIで検出されるエラーをローカルで事前に防ぐ。

## コンポーネント作成
- CVA（class-variance-authority）を使用する場合のパターンを守る。
  - CVAのベースクラス・バリアントクラスは配列形式で記述する。
  - CVAのバリアント関数の結果は既にクラス名文字列なので、直接classNameに指定する（clsxでラップしない）。
  - 例:
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
    <div className={cardVariants({ size })}>
      <span className={clsx(["text-sm", "font-bold"])}>テキスト</span>
    </div>
    ```
- `clsx` は複数クラス時に使用。クラスが1つだけなら通常の `className` を使う。
  - クラス名が2つ以上ある場合は`clsx`で配列形式で記述する。各クラスを配列要素として分割し、可読性を向上させる。
  - 例:
    ```tsx
    <span className={clsx(["text-sm", "font-bold"])}>テキスト</span>
    ```
  - クラスが1つの場合:
    ```tsx
    <span className="p-4">テキスト</span>
    ```

## Storybook と VRT 補足
- Storybook の story に `tags: ['vrt']` を付与して VRT 対象を明示する（詳細は `copilot-vrt.md` を参照）。
- Story の argTypes をメタレベルで設定すると全 story に作用するので注意する。

## bulletproof-react アーキテクチャ詳細
- bulletproof-react構造を参考にした設計
- 機能分割の徹底: 各featureは独立したコンポーネント・hooks・types・testsを持つ
- layered folder structure: components（UI）、hooks（ロジック）、types（型）、api（通信）の分離
- 共通コンポーネント: /componentsは本当に再利用される汎用的なもののみ配置
- feature間の依存: 他のfeatureを直接importしない、共通の場合は/componentsや/libに移動

## ディレクトリ構造
- `/app` - Next.js App Routerのルーティング
- `/components` - 再利用可能なUIコンポーネント、共通的なものを配置
- `/features` - 機能ごとのディレクトリ（各機能は独立しており、components・hooks・stories・types・testsを含む）
- `/lib` - ユーティリティ関数、hooks
- `/types` - 共通型定義

## テスト作成ルール

### 修正前のテスト検証
- コード修正前に既存テストが修正内容をカバーしているか確認する
- カバレッジが不足している場合は、テストケースを追加してから実装を修正する
- 手順: `pnpm test:coverage` → 未テスト箇所確認 → テスト追加 → 実装修正

### テストファイル配置
- テストファイルはコンポーネントと同じディレクトリに配置する（bulletproof-react構造）
- ファイル名: `ComponentName.test.tsx` または `functionName.test.ts`
- 例: `components/ui/ShishaCard/ShishaCard.test.tsx`

### テスト実行効率化
- 全体実行は避け、変更ファイル関連のテストのみ実行する
- 特定ファイル実行: `pnpm test:run path/to/test.tsx`
- ウォッチモード: `pnpm test:watch`（開発中推奨）

### CI安定性対策
- UIアニメーション待機には `findByRole` を使用する（`getByRole` は避ける）
- 例: `const item = await screen.findByRole("menuitem");`
- 非同期処理の完了を待つには `waitFor` を使用する

### テストパターン
- **正常系**: 基本的な動作確認（レンダリング、プロパティ表示）
- **異常系**: エラーハンドリング、不正な入力値
- **境界値**: 空文字、null、極値、0、負の値
- **エッジケース**: 特殊パターン、長い文字列、特殊文字
- **アクセシビリティ**: aria-label、role、キーボード操作（Enter/Space）

### カバレッジ目標
- コンポーネント: 80%以上を目標とする
- 重要なビジネスロジック: 100%を目指す
- `pnpm test:coverage` でカバレッジレポートを確認する

### テストのベストプラクティス
- テストは読みやすく、保守しやすく書く
- 1つのテストケースで1つの動作のみを検証する
- テストの意図が明確なテスト名を付ける
- モックは必要最小限にする
- `beforeEach` で `vi.clearAllMocks()` を実行する

詳細は `frontend/TESTING.md` を参照してください。
