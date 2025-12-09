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
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("ユーザー操作", async () => {
    const user = userEvent.setup();
    render(<Component {...defaultProps} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "新しい値");

    expect(defaultProps.onChange).toHaveBeenCalledWith("新しい値");
  });
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
  const { container } = render(<Component value={maliciousInput} />);
  expect(container.querySelector("script")).toBeNull();
});
```

---

## 📋 テストチェックリスト

### ✅ コンポーネントテスト

- 基本的なレンダリング
- プロパティの正しい表示
- ユーザー操作（クリック、入力等）
- コールバック関数の呼び出し
- エラー状態の処理
- アクセシビリティ（aria-label、role等）

### ✅ ユーティリティ関数テスト

- 正常系の動作
- 異常系の処理
- 境界値テスト
- 型安全性

---

## 🎯 実践的ベストプラクティス

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
