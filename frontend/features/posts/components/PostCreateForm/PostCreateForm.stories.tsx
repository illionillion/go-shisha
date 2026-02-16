import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Flavor } from "@/types/domain";
import { PostCreateForm } from "./PostCreateForm";

// モックフレーバーデータ
const mockFlavors: Flavor[] = [
  { id: 1, name: "ミント", color: "#00D9FF" },
  { id: 2, name: "アップル", color: "#80FF00" },
  { id: 3, name: "グレープ", color: "#9D00FF" },
  { id: 4, name: "レモン", color: "#FFD800" },
  { id: 5, name: "ストロベリー", color: "#FF0080" },
];

const meta = {
  title: "Features/Posts/PostCreateForm",
  component: PostCreateForm,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    onSubmit: { action: "submit" },
    onCancel: { action: "cancel" },
  },
} satisfies Meta<typeof PostCreateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示（画像選択ステップ）
 */
export const Default: Story = {
  args: {
    flavors: mockFlavors,
    onSubmit: async (slides) => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * フレーバーなし
 */
export const NoFlavors: Story = {
  args: {
    flavors: [],
    onSubmit: async (slides) => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * 無効状態（投稿中）
 */
export const Disabled: Story = {
  args: {
    flavors: mockFlavors,
    disabled: true,
    onSubmit: async (slides) => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * ファイル数制限（最大3枚）
 */
export const LimitedFiles: Story = {
  args: {
    flavors: mockFlavors,
    maxFiles: 3,
    onSubmit: async (slides) => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>
    ),
  ],
};
