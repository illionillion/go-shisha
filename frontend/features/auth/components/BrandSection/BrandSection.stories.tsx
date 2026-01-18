import type { Meta, StoryObj } from "@storybook/nextjs";
import { BrandSection } from "./BrandSection";

/**
 * 認証画面の左側に表示されるブランディングエリア
 *
 * シーシャのテーマカラーを使用したグラデーション背景に、
 * ロゴ、キャッチコピー、サービスの特徴を表示します。
 */
const meta = {
  title: "Features/Auth/BrandSection",
  component: BrandSection,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BrandSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 *
 * ロゴ、キャッチコピー、特徴リストが全て表示されます。
 * フェードインアニメーションが適用されます。
 */
export const Default: Story = {
  tags: ["vrt"],
};

/**
 * 高さ固定での表示
 *
 * 実際の認証画面での表示イメージを確認できます。
 */
export const InAuthLayout: Story = {
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
  tags: ["vrt"],
};
