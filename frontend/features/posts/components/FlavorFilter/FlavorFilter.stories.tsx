import type { Meta, StoryObj } from "@storybook/nextjs";
import { FlavorFilter } from "./FlavorFilter";

const meta = {
  title: "Features/Posts/FlavorFilter",
  component: FlavorFilter,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    flavors: {
      description: "フレーバー一覧",
    },
    selectedFlavorIds: {
      description: "選択中のフレーバーID配列",
    },
    onFlavorToggle: {
      action: "flavor toggled",
      description: "フレーバー選択切り替えハンドラー",
    },
  },
} satisfies Meta<typeof FlavorFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockFlavors = [
  { id: 1, name: "ミント", color: "bg-green-500" },
  { id: 2, name: "アップル", color: "bg-red-500" },
  { id: 3, name: "ベリー", color: "bg-purple-500" },
  { id: 4, name: "マンゴー", color: "bg-yellow-500" },
  { id: 5, name: "オレンジ", color: "bg-orange-500" },
  { id: 6, name: "グレープ", color: "bg-indigo-500" },
];

/**
 * デフォルト（未選択）- VRT対象
 */
export const Default: Story = {
  tags: ["vrt"],
  args: {
    flavors: mockFlavors,
    selectedFlavorIds: [],
    onFlavorToggle: () => {},
  },
};

/**
 * インタラクティブ版 - 実際に選択・解除できる
 */
export const Interactive: Story = {
  tags: ["vrt"],
  args: {
    flavors: mockFlavors,
    selectedFlavorIds: [],
    onFlavorToggle: () => {},
  },
};

/**
 * インタラクティブ版（初期選択あり）
 */
export const InteractiveWithInitialSelection: Story = {
  tags: ["vrt"],
  args: {
    flavors: mockFlavors,
    selectedFlavorIds: [1, 3],
    onFlavorToggle: () => {},
  },
};

/**
 * フレーバーが空の場合（非表示）- VRT対象
 */
export const Empty: Story = {
  args: {
    flavors: [],
    selectedFlavorIds: [],
    onFlavorToggle: () => {},
  },
};
