# 🧪 テストガイド

このガイドでは、Go-Shisha プロジェクトのテスト戦略と実践的なベストプラクティスについて説明します。

## 📊 テスト構成

### ディレクトリ構造

```
frontend/
├── components/
│   └── ui/
│       └── ShishaCard/
│           ├── ShishaCard.tsx
│           ├── ShishaCard.test.tsx      # ユニットテスト
│           └── ShishaCard.stories.tsx   # Storybook
├── test/
│   └── setup.ts                # テストセットアップ
├── vitest.config.ts            # Vitest設定
└── __image_snapshots__/        # VRTスナップショット
```

### テストの種類

- **Unit Test**: コンポーネント・フック・ユーティリティ関数の単体テスト（Vitest + Testing Library）
- **Visual Regression Test (VRT)**: Storybook story の視覚的差分テスト（Playwright + test-runner）

---

## 🚀 テスト実行

```bash
# 全テスト実行
pnpm test:run

# ウォッチモード（開発中推奨）
pnpm test:watch

# UIモード
pnpm test:ui

# カバレッジレポート
pnpm test:coverage

# 特定ファイルのみ実行
pnpm test:run components/ui/ShishaCard/ShishaCard.test.tsx
```

### Visual Regression Test (VRT) 実行

```bash
# Storybookを起動してから実行
pnpm storybook  # 別ターミナルで起動
pnpm vrt

# スナップショット更新（意図的なUI変更時のみ）
pnpm vrt:update
```

#### VRT タグの運用ルール

VRT が必要な Story（`tags: ['vrt']` を付ける）:

- パネル・モーダルなどの親コンポーネント
- variant や状態変化が複雑なコンポーネント
- 編集中/非編集中など複数の状態を持つコンポーネント

VRT が不要な Story（タグを付けない）:

- 他の親コンポーネントで既に使用されている小さな共通 UI
- 見た目の差分チェックが不要な純粋な機能確認用 Story

#### VRT タグの付け方

```tsx
// ✅ VRT 必要（variant や状態が複雑）
export const Default: Story = {
  tags: ["vrt"],
  args: {
    variant: "default",
    // ...
  },
};

// ❌ VRT 不要（親コンポーネントでカバー済み）
export const SimpleButton: Story = {
  args: {
    label: "Click me",
  },
};
```

#### VRT 実行結果の確認

```bash
# VRT 実行後、スナップショットは __image_snapshots__ に保存される
ls __image_snapshots__

# CI で差分が検出された場合は差分画像を確認して意図した変更か判断する
```

---

## 📝 テストの書き方

### Testing Library の優先順位

Testing Library では、**ユーザーが要素を見つける方法に近い順**でクエリを使用します。

#### 推奨されるクエリの優先順位

1. **`getByRole`** ⭐ 最優先
   - アクセシビリティを保証
   - スクリーンリーダーでも動作
   - 例: `getByRole('button', { name: '送信' })`

2. **`getByLabelText`**
   - フォーム要素に最適
   - 例: `getByLabelText('メールアドレス')`

3. **`getByPlaceholderText`**
   - placeholder があるフォーム要素
   - 例: `getByPlaceholderText('example@email.com')`

4. **`getByText`**
   - 非インタラクティブ要素（段落、div など）
   - 例: `getByText('投稿が完了しました')`

5. **`getByAltText`**
   - 画像、area 要素
   - 例: `getByAltText('プロフィール画像')`

6. **`getByTitle`**
   - title 属性を持つ要素
   - 例: `getByTitle('閉じる')`

#### ❌ 避けるべきクエリ

- **`getByTestId`**: 最終手段としてのみ使用
  - 実装詳細に依存
  - アクセシビリティを保証しない
  - どうしても必要な場合のみ使用

- **`container.querySelector()`**: 原則使用禁止
  - CSS セレクタは実装詳細
  - リファクタリングで壊れやすい
  - 例外: グリッドレイアウトのスタイル検証など、Testing Library のクエリでは取得できない場合のみ

### 基本構造

```tsx
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

describe("ComponentName", () => {
  const defaultProps = { value: "test", onChange: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("基本的なレンダリング", () => {
    render(<Component {...defaultProps} />);
    // ✅ role でアクセス
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("ユーザー操作", async () => {
    const user = userEvent.setup();
    render(<Component {...defaultProps} />);

    // ✅ role + name で特定
    const input = screen.getByRole("textbox", { name: "ユーザー名" });
    await user.type(input, "新しい値");

    expect(defaultProps.onChange).toHaveBeenCalledWith("新しい値");
  });

  test("複数のボタンがある場合", () => {
    render(<Component {...defaultProps} />);

    // ✅ getAllByRole + find で識別
    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((btn) => btn.textContent?.includes("送信"));

    expect(submitButton).toBeInTheDocument();
  });
});
```

### 実践例

```tsx
// ❌ 悪い例
test("悪い例", () => {
  const { container } = render(<PostCard post={mockPost} />);
  const card = container.querySelector(".post-card");
  const button = container.querySelector("button[data-testid='like-btn']");
});

// ✅ 良い例
test("良い例", () => {
  render(<PostCard post={mockPost} />);

  // role + name で特定
  const likeButton = screen.getByRole("button", { name: "いいね" });

  // 複数ある場合は getAllByRole + find
  const buttons = screen.getAllByRole("button");
  const card = buttons.find((btn) => btn.textContent?.includes("投稿内容"));

  expect(likeButton).toBeInTheDocument();
  expect(card).toBeInTheDocument();
});
```

### モッキング

```tsx
// 外部ライブラリのモック
vi.mock("next/image", () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// React コンポーネントのモック
vi.mock("@/components/Header", () => ({
  Header: ({ title }: any) => <header>{title}</header>,
}));
```

### ユーティリティ関数テスト

```tsx
import { describe, test, expect } from "vitest";
import { formatDate } from "@/lib/utils/date";

describe("formatDate", () => {
  test("基本的な日付フォーマット", () => {
    const date = new Date("2024-01-01");
    expect(formatDate(date)).toBe("2024年1月1日");
  });

  test("不正な日付でエラーが発生する", () => {
    expect(() => formatDate(null as any)).toThrow();
  });
});
```

---

## 🎯 テストパターン

### 1. 基本機能テスト

レンダリング、プロパティ表示、デフォルト値の動作確認

### 2. ユーザー操作テスト

クリック、変更、キーボード操作、フォーム送信

### 3. エラーハンドリングテスト

不正な入力値、APIエラー、境界値テスト

### 4. セキュリティテスト

```tsx
test("悪意のあるコードが安全に処理される", () => {
  const maliciousInput = '<script>alert("XSS")</script>';
  render(<Component value={maliciousInput} />);

  // ✅ getByText でエスケープされた文字列を確認
  expect(screen.getByText(/script/i)).toBeInTheDocument();

  // script タグが実際に挿入されていないことを確認（例外的に querySelector 使用）
  const { container } = render(<Component value={maliciousInput} />);
  expect(container.querySelector("script")).toBeNull();
});
```

---

## 📋 テストチェックリスト

### ✅ コンポーネントテスト

- 基本的なレンダリング（`getByRole` 優先）
- プロパティの正しい表示（`getByText`, `getByLabelText`）
- ユーザー操作（クリック、入力等）
- コールバック関数の呼び出し
- エラー状態の処理
- アクセシビリティ（`role`, `aria-label` 等が正しく設定されているか）

### ✅ クエリ選択のチェックポイント

1. `getByRole` を最優先で使用
2. フォーム要素は `getByLabelText`
3. 非インタラクティブ要素は `getByText`
4. 複数要素がある場合は `getAllBy*` + `find()`
5. `data-testid` は最終手段
6. `container.querySelector()` は原則禁止（例外: スタイル検証のみ）

### ✅ ユーティリティ関数テスト

- 正常系の動作
- 異常系の処理
- 境界値テスト
- 型安全性

---

## 🎯 実践的ベストプラクティス

### クエリの選び方

**原則: ユーザーが要素を見つける方法に近い順で選ぶ**

```tsx
// ✅ 良い例: アクセシビリティを考慮 + userEvent使用
test("ボタンをクリック", async () => {
  const user = userEvent.setup();
  render(<SubmitButton />);
  const button = screen.getByRole("button", { name: "送信" });
  await user.click(button);
});

// ❌ 悪い例: 実装詳細に依存
test("ボタンをクリック", () => {
  const { container } = render(<SubmitButton />);
  const button = container.querySelector(".submit-btn");
  fireEvent.click(button);
});
```

### 複数要素の扱い

```tsx
// ✅ 良い例: getAllByRole + find で識別
test("複数のカードから特定のカードを選択", () => {
  render(<PostList posts={mockPosts} />);

  const cards = screen.getAllByRole("button");
  const targetCard = cards.find((card) => card.textContent?.includes("特定の投稿"));

  expect(targetCard).toBeInTheDocument();
});

// ❌ 悪い例: data-testid で識別
test("複数のカードから特定のカードを選択", () => {
  render(<PostList posts={mockPosts} />);
  const card = screen.getByTestId("post-card-1");
  expect(card).toBeInTheDocument();
});
```

### 修正前のテスト検証

コード修正前に既存テストが修正内容をカバーしているか確認。不足していればテストケース追加。

```bash
# 1. 対象テスト確認 → 2. カバレッジ確認 → 3. 必要に応じてテスト追加 → 4. 実装修正
pnpm test:coverage
```

### CI安定性対策

UIアニメーション待機には `findByRole` を使用：

```tsx
// ❌ CI失敗の可能性
const item = screen.getByRole("menuitem");

// ✅ アニメーション完了を待機
const item = await screen.findByRole("menuitem");
```

### ユーザー操作のベストプラクティス

#### userEvent vs fireEvent

**原則: `userEvent` を使用する**（より実際のユーザー操作に近い）

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ✅ 良い例: userEvent を使用
test("入力フォームのテスト", async () => {
  const user = userEvent.setup();
  render(<InputForm />);

  const input = screen.getByRole("textbox");
  await user.type(input, "テキスト入力");
  await user.click(screen.getByRole("button", { name: "送信" }));

  expect(screen.getByText("送信完了")).toBeInTheDocument();
});

// ❌ 悪い例: fireEvent を使用（非推奨）
test("入力フォームのテスト", () => {
  render(<InputForm />);

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "テキスト入力" } });
  fireEvent.click(screen.getByRole("button", { name: "送信" }));

  expect(screen.getByText("送信完了")).toBeInTheDocument();
});
```

#### userEvent の主な API

```tsx
const user = userEvent.setup();

// クリック
await user.click(element);
await user.dblClick(element);

// キーボード入力
await user.type(input, "テキスト");
await user.clear(input);
await user.keyboard("{Enter}");
await user.keyboard("{Escape}");

// 選択
await user.selectOptions(select, "option-value");

// ホバー
await user.hover(element);
await user.unhover(element);

// タブキー
await user.tab();
```

#### 非同期操作の待機

```tsx
// ✅ findBy*: 要素が現れるまで待機（デフォルト1秒）
test("非同期でロードされる要素", async () => {
  render(<AsyncComponent />);

  // 要素が現れるまで最大1秒待機
  const message = await screen.findByText("読み込み完了");
  expect(message).toBeInTheDocument();
});

// ✅ waitFor: 条件が満たされるまで待機
test("状態変化を待機", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole("button", { name: "インクリメント" }));

  await waitFor(() => {
    expect(screen.getByText("カウント: 1")).toBeInTheDocument();
  });
});

// ❌ 悪い例: getBy* で非同期要素を取得（失敗する）
test("非同期でロードされる要素", () => {
  render(<AsyncComponent />);

  // エラー: 要素がまだ存在しない
  const message = screen.getByText("読み込み完了");
  expect(message).toBeInTheDocument();
});
```

#### クエリの種類と使い分け

| クエリ     | 戻り値        | 非同期 | タイミング         |
| ---------- | ------------- | ------ | ------------------ |
| `getBy*`   | 要素 / エラー | ❌     | 即座に存在する要素 |
| `queryBy*` | 要素 / null   | ❌     | 要素の不在を確認   |
| `findBy*`  | Promise<要素> | ✅     | 非同期で現れる要素 |

```tsx
// getBy*: 即座に存在するはずの要素
const button = screen.getByRole("button", { name: "送信" });

// queryBy*: 要素が存在しないことを確認
expect(screen.queryByText("エラー")).not.toBeInTheDocument();

// findBy*: 非同期で現れる要素
const message = await screen.findByText("読み込み完了");
```

### テスト設計

- **正常系**: 基本的な動作確認
- **異常系**: エラーハンドリング
- **境界値**: 空文字、null、極値
- **エッジケース**: 特殊パターン
- **アクセシビリティ**: aria-label、role、キーボード操作

### 効率的テスト実行

変更ファイル関連のテストのみ実行して開発速度向上：

```bash
# 特定ファイルのみ実行
pnpm test:run components/ui/component-name.test.tsx

# 全体実行は避ける
```

---

## 🔧 環境設定

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".next/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/*.stories.tsx",
        "coverage/**",
        "test/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### test/setup.ts

```typescript
import "@testing-library/jest-dom";
import { vi } from "vitest";

// グローバルなモックやセットアップ
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

---

## 🐛 トラブルシューティング

### よくある問題

- **間欠的失敗**: `waitFor` や `findBy*` を使用
- **モック効かない**: `vi.clearAllMocks()` を `beforeEach` で実行
- **DOM操作失敗**: `screen.debug()` で状態確認

### デバッグ

```tsx
// DOM確認
screen.debug();

// 特定要素のみ確認
screen.debug(screen.getByTestId("my-element"));

// 非同期待機
await waitFor(() => {
  expect(screen.getByText("完了")).toBeInTheDocument();
});
```

---

## 📈 継続的改善

### カバレッジ向上

1. 未テスト箇所の特定: カバレッジレポートで確認
2. 優先度付け: 重要な機能から順次テスト追加
3. リファクタリング: テストしやすいコード構造に改善

### テスト品質向上

- **定期的なレビュー**: テストコードの品質チェック
- **パフォーマンス**: テスト実行時間の最適化
- **メンテナンス性**: 読みやすく保守しやすいテスト

---

詳細な開発情報は [README.md](./README.md) をご覧ください。
