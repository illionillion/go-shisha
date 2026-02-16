import type { Meta, StoryObj } from "@storybook/nextjs";
import { ImageUploader } from "./ImageUploader";

// Base64エンコードされた小さな画像データ（1x1px カラフルなPNG）
const createImageFile = (name: string, color: string, sizeKB: number): File => {
  // 1x1pxのPNG画像をCanvas APIで生成
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 150;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // 背景色
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 200, 150);

    // ファイル名表示
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, 100, 75);
  }

  // DataURLを取得
  const dataUrl = canvas.toDataURL("image/png");

  // DataURLをBlobに変換
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  // 指定されたサイズに近づけるためにパディング追加
  const targetSize = sizeKB * 1024;
  const currentSize = u8arr.length;
  const paddingSize = Math.max(0, targetSize - currentSize);
  const paddedArray = new Uint8Array(u8arr.length + paddingSize);
  paddedArray.set(u8arr);

  return new File([new Blob([paddedArray])], name, { type: mime });
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
      createImageFile("beach-sunset.jpg", "#FF6B6B", 2048),
      createImageFile("mountain-view.png", "#4ECDC4", 1536),
      createImageFile("city-night.webp", "#45B7D1", 3072),
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
    value: [
      createImageFile("image-1.jpg", "#FF6B6B", 512),
      createImageFile("image-2.jpg", "#4ECDC4", 1024),
      createImageFile("image-3.jpg", "#45B7D1", 1536),
      createImageFile("image-4.jpg", "#96CEB4", 2048),
      createImageFile("image-5.jpg", "#FFEAA7", 2560),
      createImageFile("image-6.jpg", "#DFE6E9", 3072),
      createImageFile("image-7.jpg", "#74B9FF", 3584),
      createImageFile("image-8.jpg", "#A29BFE", 4096),
      createImageFile("image-9.jpg", "#FD79A8", 4608),
    ],
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
