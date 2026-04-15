import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileHeader } from "./ProfileHeader";

const meta = {
  title: "Components/ProfileHeader",
  component: ProfileHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs", "vrt", "vrt-sp"],
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    displayName: "山田 太郎",
    bio: "シーシャ好きのフロントエンドエンジニア\n週末は友人とカフェ巡りをします。",
    externalUrl: "https://example.com",
    iconUrl: "",
  },
};

/**
 * 自分のプロフィール（編集ボタンあり）
 */
export const OwnProfile: Story = {
  args: {
    displayName: "山田 太郎",
    bio: "シーシャ好きのフロントエンドエンジニア\n週末は友人とカフェ巡りをします。",
    externalUrl: "https://example.com",
    iconUrl: "",
    onEditClick: () => {},
  },
};
