import type { Meta, StoryObj } from "@storybook/nextjs";
import { ImageUploader } from "./ImageUploader";

const meta = {
  title: "Features/Posts/ImageUploader",
  component: ImageUploader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onFilesSelected: { action: "files selected" },
  },
} satisfies Meta<typeof ImageUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 *
 * 画像をドラッグ&ドロップまたはクリックで選択
 */
export const Default: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log("Selected files:", files);
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">画像アップロード</h2>
        <Story />
      </div>
    ),
  ],
};

/**
 * ファイル数制限
 *
 * 最大3枚まで選択可能
 */
export const LimitedFiles: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log("Selected files:", files);
    },
    maxFiles: 3,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">最大3枚まで</h2>
        <Story />
      </div>
    ),
  ],
};

/**
 * ファイルサイズ制限
 *
 * 各ファイル5MB以下
 */
export const SizeLimit: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log("Selected files:", files);
    },
    maxSizeMB: 5,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">5MB以下のファイル</h2>
        <Story />
      </div>
    ),
  ],
};

/**
 * 無効状態
 *
 * アップロード不可の状態
 */
export const Disabled: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log("Selected files:", files);
    },
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">無効状態</h2>
        <Story />
      </div>
    ),
  ],
};

/**
 * PNG/JPGのみ
 *
 * 受け入れ形式を制限
 */
export const LimitedFormats: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log("Selected files:", files);
    },
    acceptedFormats: ["image/jpeg", "image/jpg", "image/png"],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">PNG/JPGのみ受付</h2>
        <Story />
      </div>
    ),
  ],
};
