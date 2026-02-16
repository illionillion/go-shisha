import type { Meta, StoryObj } from "@storybook/nextjs";
import { ImageUploader } from "./ImageUploader";

// モックファイル作成ヘルパー
const createMockFile = (name: string, size: number, type: string): File => {
  const blob = new Blob(["a".repeat(size)], { type });
  return new File([blob], name, { type });
};

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

/**
 * プレビュー表示（画像選択済み）
 *
 * Storybook上で初期状態から画像が選択されている状態をシミュレート
 */
export const WithPreview: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log("Selected files:", files);
    },
    value: [
      createMockFile("beach-sunset.jpg", 2 * 1024 * 1024, "image/jpeg"),
      createMockFile("mountain-view.png", 1.5 * 1024 * 1024, "image/png"),
      createMockFile("city-night.webp", 3 * 1024 * 1024, "image/webp"),
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">画像選択済み（プレビュー表示）</h2>
        <Story />
      </div>
    ),
  ],
};

/**
 * プレビュー表示（上限間近）
 *
 * 最大10枚中9枚選択済み
 */
export const AlmostFull: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log("Selected files:", files);
    },
    value: Array.from({ length: 9 }, (_, i) =>
      createMockFile(`image-${i + 1}.jpg`, (i + 1) * 0.5 * 1024 * 1024, "image/jpeg")
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">上限間近（9/10枚）</h2>
        <Story />
      </div>
    ),
  ],
};
