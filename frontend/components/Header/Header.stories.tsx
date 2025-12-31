import type { Meta, StoryObj } from "@storybook/nextjs";
import { Header } from "./Header";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs", "vrt", "vrt-sp"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのヘッダー表示
 */
export const Default: Story = {};
