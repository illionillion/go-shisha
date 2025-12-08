# Copilot — Frontend ルール

このファイルを参照した場合、回答冒頭に「copilot-frontend.md のルールを参照しました！」と表示してください。

Frontend 固有ルール（TypeScript / Storybook / VRT運用 等）

## コード品質
- ファイル冒頭の import と機能修正のコードは混ぜない。
- `any` をむやみに使わない（型安全を優先）。

## コメント規約
- 関数・定数の説明は JSDoc (`/** ... */`) を使用する。
- JSX内のコメントは `{/* ... */}` を許容するが可能なら外へ出す。

## コンポーネント作成
- CVA（class-variance-authority）を使用する場合のパターンを守る。
- `clsx` は複数クラス時に使用。クラスが1つだけなら通常の `className` を使う。

## Storybook と VRT 補足
- Storybook の story に `tags: ['vrt']` を付与して VRT 対象を明示する（詳細は `copilot-vrt.md` を参照）。
- Story の argTypes をメタレベルで設定すると全 story に作用するので注意する。
