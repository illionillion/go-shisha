import type { Meta, StoryObj } from "@storybook/nextjs";
import ProfileHeader from "./ProfileHeader";

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

const sampleUser = {
  id: 1,
  display_name: "山田 太郎",
  description: "シーシャ好きのフロントエンドエンジニア\n週末は友人とカフェ巡りをします。",
  external_url: "https://example.com",
  icon_url: "/images/sample-avatar.png",
};

export const Default: Story = {
  args: {
    user: sampleUser,
  },
};
