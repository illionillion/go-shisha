import type { Meta, StoryObj } from "@storybook/nextjs";
import { AuthLayout } from "./AuthLayout";

/**
 * 認証画面用の2カラムレイアウトコンポーネント
 *
 * X（旧Twitter）やLinkedInのような分割レイアウトを提供します。
 */
const meta = {
  title: "Features/Auth/AuthLayout",
  component: AuthLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な2カラムレイアウト
 *
 * 左側にブランドコンテンツ、右側にフォームコンテンツを表示します。
 */
export const Default: Story = {
  args: {
    brandContent: (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">Go Shisha</h1>
          <p className="mt-4 text-xl">あなたのシーシャ体験を共有しよう</p>
        </div>
      </div>
    ),
    formContent: (
      <div className="rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">ログイン</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="••••••••••••"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            ログイン
          </button>
        </form>
      </div>
    ),
  },
  tags: ["vrt"],
};

/**
 * ブランドエリアのみ
 *
 * 左側のブランドエリアの表示を確認できます。
 */
export const BrandOnly: Story = {
  args: {
    brandContent: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-12 text-white">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Go Shisha</h1>
          <p className="mt-4 text-2xl">あなたのシーシャ体験を共有しよう</p>
        </div>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">📸</div>
            <p className="text-lg">投稿でシェア</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">❤️</div>
            <p className="text-lg">いいねで交流</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">👥</div>
            <p className="text-lg">コミュニティ参加</p>
          </div>
        </div>
      </div>
    ),
    formContent: <div className="text-center text-gray-500">Form Area</div>,
  },
};

/**
 * フォームエリアのみ
 *
 * 右側のフォームエリアの表示を確認できます。
 */
export const FormOnly: Story = {
  args: {
    brandContent: (
      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
        Brand Area
      </div>
    ),
    formContent: (
      <div className="w-full rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">登録</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">表示名</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              placeholder="山田太郎"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              placeholder="••••••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード（確認）</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              placeholder="••••••••••••"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            登録
          </button>
        </form>
      </div>
    ),
  },
  tags: ["vrt"],
};
