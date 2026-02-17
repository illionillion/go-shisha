import type { Meta, StoryObj } from "@storybook/nextjs";
import { PostCreateFAB } from "./PostCreateFAB";

const meta = {
  title: "Features/Posts/PostCreateFAB",
  component: PostCreateFAB,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof PostCreateFAB>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 *
 * 画面右下に固定表示されるFABボタン
 */
export const Default: Story = {
  args: {
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen bg-gray-100">
        <div className="p-8">
          <h1 className="text-2xl font-bold">投稿作成FAB</h1>
          <p className="mt-2 text-gray-600">右下のプラスボタンをクリックしてください</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

/**
 * カスタムARIAラベル
 */
export const CustomAriaLabel: Story = {
  args: {
    onClick: () => {},
    "aria-label": "新しい投稿を作成",
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen bg-gray-100">
        <Story />
      </div>
    ),
  ],
};

/**
 * ホバー状態のプレビュー
 */
export const HoverState: Story = {
  args: {
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen bg-gray-100">
        <div className="p-8">
          <p className="text-gray-600">
            ボタンにマウスをホバーすると、背景色が濃くなり影が大きくなります
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    pseudo: { hover: true },
  },
};
