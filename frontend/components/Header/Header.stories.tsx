import type { Meta, StoryObj } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { User } from "@/types/domain";
import { Header } from "./Header";

const mockUser: User = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "",
  description: "これはテストユーザーです",
};

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs", "vrt", "vrt-sp"],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
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
