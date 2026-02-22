import type { Meta, StoryObj } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { User } from "@/types/domain";
import { PostCreateContainer } from "./PostCreateContainer";

const mockUser: User = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "",
  description: "テストユーザーです",
};

const meta = {
  title: "Features/Posts/PostCreateContainer",
  component: PostCreateContainer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
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
          <div className="relative min-h-screen bg-gray-100 p-8">
            <p className="text-gray-600">右下のFABボタンをクリックして投稿作成モーダルを開きます</p>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof PostCreateContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ログイン済み状態（FABが表示される）
 */
export const LoggedIn: Story = {
  tags: ["vrt", "vrt-sp"],
  decorators: [
    (Story) => {
      useAuthStore.setState({ user: mockUser, isLoading: false });
      return <Story />;
    },
  ],
};

/**
 * 未ログイン状態（FABが非表示になる）
 */
export const LoggedOut: Story = {
  tags: ["vrt", "vrt-sp"],
  decorators: [
    (Story) => {
      useAuthStore.setState({ user: null, isLoading: false });
      return <Story />;
    },
  ],
};
