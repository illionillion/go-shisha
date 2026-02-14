import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import type { Flavor } from "@/types/domain";
import { FlavorSelector } from ".";

// モックフレーバーデータ
const mockFlavors: Flavor[] = [
  {
    id: 1,
    name: "ミント",
    color: "bg-green-500",
  },
  {
    id: 2,
    name: "ベリー",
    color: "bg-red-500",
  },
  {
    id: 3,
    name: "グレープ",
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "レモン",
    color: "bg-yellow-500",
  },
  {
    id: 5,
    name: "オレンジ",
    color: "bg-orange-500",
  },
  {
    id: 6,
    name: "ブルーベリー",
    color: "bg-indigo-500",
  },
];

const meta = {
  title: "Features/Posts/FlavorSelector",
  component: FlavorSelector,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    flavors: {
      description: "フレーバー一覧（GET /api/v1/flavors から取得）",
    },
    selectedFlavorId: {
      description: "選択されたフレーバーのID",
    },
    onSelect: {
      description: "フレーバー選択時のコールバック",
      action: "selected",
    },
    error: {
      description: "エラーメッセージ",
    },
    disabled: {
      description: "無効化状態",
    },
    className: {
      description: "カスタムクラス名",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "600px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FlavorSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（未選択）
 */
export const Default: Story = {
  args: {
    flavors: mockFlavors,
    selectedFlavorId: undefined,
    onSelect: () => {},
  },
};

/**
 * フレーバー選択済み（ミント）
 */
export const SelectedMint: Story = {
  args: {
    flavors: mockFlavors,
    selectedFlavorId: 1,
    onSelect: () => {},
  },
};

/**
 * フレーバー選択済み（ベリー）
 */
export const SelectedBerry: Story = {
  args: {
    flavors: mockFlavors,
    selectedFlavorId: 2,
    onSelect: () => {},
  },
};

/**
 * エラー状態
 */
export const WithError: Story = {
  args: {
    flavors: mockFlavors,
    selectedFlavorId: undefined,
    error: "フレーバーの選択に失敗しました",
    onSelect: () => {},
  },
};

/**
 * 無効化状態（ローディング中等）
 */
export const Disabled: Story = {
  args: {
    flavors: mockFlavors,
    selectedFlavorId: 1,
    disabled: true,
    onSelect: () => {},
  },
};

/**
 * フレーバーなし（空配列）
 */
export const NoFlavors: Story = {
  args: {
    flavors: [],
    selectedFlavorId: undefined,
    onSelect: () => {},
  },
};

/**
 * インタラクティブデモ（選択状態を管理）
 * ユーザーが実際にフレーバーを選択・選択解除できる
 */
export const Interactive: Story = {
  render: (args) => {
    const [selectedFlavorId, setSelectedFlavorId] = useState<number | undefined>(
      args.selectedFlavorId
    );
    return (
      <FlavorSelector
        {...args}
        selectedFlavorId={selectedFlavorId}
        onSelect={setSelectedFlavorId}
      />
    );
  },
  args: {
    flavors: mockFlavors,
    selectedFlavorId: undefined,
    onSelect: () => {},
  },
};
