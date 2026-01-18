import type { Meta, StoryObj } from "@storybook/nextjs";
import { LoginForm } from "./LoginForm";

/**
 * ログインフォームコンポーネント
 *
 * メール・パスワードを入力してログインするフォーム。
 * React Hook Form + zodによるバリデーション実装。
 */
const meta = {
  title: "Features/Auth/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onSubmit: () => {},
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態
 *
 * 通常のログインフォーム表示。
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
 * ログイン処理中の状態。ボタンが無効化され、テキストが変更されます。
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
    errorMessage: "メールアドレスまたはパスワードが正しくありません",
  },
  tags: ["vrt"],
};
