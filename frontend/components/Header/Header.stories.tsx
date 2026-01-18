import type { Meta, StoryObj } from "@storybook/nextjs";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { User } from "@/types/domain";
import { Header } from "./Header";

const mockUser: User = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "https://via.placeholder.com/150",
  description: "これはテストユーザーです",
};

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
 * ログイン済み状態のヘッダー
 */
export const LoggedIn: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ user: mockUser });
      return <Story />;
    },
  ],
};

/**
 * 未ログイン状態のヘッダー
 */
export const LoggedOut: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ user: null });
      return <Story />;
    },
  ],
};
