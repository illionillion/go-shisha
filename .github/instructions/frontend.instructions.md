---
applyTo: "frontend/**"
---

# Frontend 固有ルール

このファイルを参照した場合、回答冒頭に「frontend.instructions.md のルールを参照しました！」と表示してください。

## コード品質の基本
- ファイル冒頭のimport文セクションに機能修正のコードを混在させない
- 配列などの`{}`の開始終了を明確にする
- ソースコードが壊れないように注意する
- `any`禁止、型安全に実装する

## コメント記述規則
- **TypeScript/JavaScript**: 関数と定数にコメントを書く場合は必ずJSDoc形式`/**...*/`を使用する。詳細な説明・例・制約を記載する
- **例外**: JSX内のコメントは`{/* ... */}`形式を許可する。可能であればコンポーネント外に通常のコメント`//`で記述することを推奨する

## Frontend変更時のチェック手順
1. `pnpm fix` で自動修正を試みる（大半の問題を解決できる）
2. 失敗した場合のみ `pnpm check` で詳細調査

## コンポーネント作成

### CVA（class-variance-authority）パターン
```tsx
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

<div className={cardVariants({ size })}>
  <span className={clsx(["text-sm", "font-bold"])}>テキスト</span>
</div>
```

### clsx の使い方
- クラスが2つ以上: `className={clsx(["text-sm", "font-bold"])}`
- クラスが1つ: `className="p-4"`（clsx不要）
- CVAの結果は直接 `className` に指定するだけでよい（clsxでラップしない）

## Storybook と VRT

### VRTタグ付与方針
- VRT対象のstoryには `tags: ['vrt']` を付与する
  - **VRT必要**: パネル・モーダル等の親コンポーネント、variant/状態変化が複雑なコンポーネント
  - **VRT不要**: 親コンポーネントで既にカバーされている小さな共通UI
- SP時のVRT: `tags: ['vrt-sp']` を追加
- Story の `argTypes` をメタレベルで設定すると全storyに作用するので注意

### スナップショット運用
- スナップショットは `frontend/__image_snapshots__/` で管理し、CIで比較する
- 差分は `__diff_output__/` に出力（`.gitignore` で除外済み）
- スナップショットを更新した場合は必ず差分画像を目視で確認する

### テストランナー設定
- ビューポート: 1280x800（PC）
- カラースキーム: light
- `postVisit`: `page.waitForLoadState('networkidle')` を使用
- 画像比較許容: `failureThreshold: 0.01`（フォント・AA差分対策）

VRT実行手順は [vrt-run skill](../skills/vrt-run/SKILL.md) を参照

## bulletproof-react アーキテクチャ
- 機能分割の徹底: 各featureは独立したコンポーネント・hooks・types・testsを持つ
- 共通コンポーネント: `/components` は本当に再利用される汎用的なもののみ
- feature間の依存: 他のfeatureを直接importしない。共通の場合は `/components` や `/lib` に移動

## ディレクトリ構造
- `/app` - Next.js App Routerのルーティング
- `/components` - 再利用可能なUIコンポーネント
- `/features` - 機能ごとのディレクトリ（components・hooks・stories・types・testsを含む）
- `/lib` - ユーティリティ関数、hooks
- `/types` - 共通型定義
- `/api` - Orval自動生成APIクライアント（直接使わず `types/domain.ts` 経由で利用する）

## 生成型の再エクスポート運用
- `/frontend/api` の自動生成型は `frontend/types/domain.ts` で再エクスポートした型を使用する
- OpenAPI / スキーマが更新された際は `frontend/types/domain.ts` のエイリアスを見直す
- 例外: `frontend/api`（生成コード）、`frontend/services`、`frontend/lib/adapters` 内では直接生成型を扱ってよい

## テスト作成ルール

### テストファイル配置
- コンポーネントと同じディレクトリに配置する
- ファイル名: `ComponentName.test.tsx` または `functionName.test.ts`

### テスト実行
```bash
pnpm test:run path/to/test.tsx   # 特定ファイル
pnpm test:watch                   # ウォッチモード（開発中推奨）
pnpm test:coverage                # カバレッジ確認
```

### CI安定性対策
- UIアニメーション待機には `findByRole` を使用する（`getByRole` は避ける）
- 非同期処理の完了を待つには `waitFor` を使用する

### テストパターン
- **正常系**: 基本的な動作確認（レンダリング、プロパティ表示）
- **異常系**: エラーハンドリング、不正な入力値
- **境界値**: 空文字、null、極値、0、負の値
- **アクセシビリティ**: aria-label、role、キーボード操作（Enter/Space）

### カバレッジ目標
- コンポーネント: 80%以上
- 重要なビジネスロジック: 100%

### テストのベストプラクティス
- テストは読みやすく、保守しやすく書く
- 1つのテストケースで1つの動作のみを検証する
- テストの意図が明確なテスト名を付ける
- モックは必要最小限にする
- `beforeEach` で `vi.clearAllMocks()` を実行する

詳細は `frontend/TESTING.md` を参照してください。
