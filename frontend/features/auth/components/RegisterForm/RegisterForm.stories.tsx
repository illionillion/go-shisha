import type { Meta, StoryObj } from "@storybook/nextjs";
import { RegisterForm } from "./RegisterForm";

/**
 * 登録フォームコンポーネント
 *
 * メール・パスワード・確認・表示名を入力して登録するフォーム。
 * React Hook Form + zodによるバリデーション実装。
 * パスワード強度インジケーター付き。
 */
const meta = {
  title: "Features/Auth/RegisterForm",
  component: RegisterForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onSubmit: () => {},
  },
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態
 *
 * 通常の登録フォーム表示。
 */
export const Default: Story = {
  args: {
    isLoading: false,
  },
  tags: ["vrt"],
};

/**
 * ローディング状態
 *
 * 登録処理中の状態。ボタンが無効化され、テキストが変更されます。
 */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
  tags: ["vrt"],
};

/**
 * エラー状態
 *
 * サーバーエラーが発生した際の表示。
 */
export const WithError: Story = {
  args: {
    isLoading: false,
    errorMessage: "このメールアドレスは既に使用されています",
  },
  tags: ["vrt"],
};
