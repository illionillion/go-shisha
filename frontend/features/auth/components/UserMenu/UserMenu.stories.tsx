import type { Meta, StoryObj } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { User } from "@/types/domain";
import { UserMenu } from "./UserMenu";

const mockUser: User = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "",
  description: "これはテストユーザーです",
};

/**
 * ユーザーメニューコンポーネントのStory
 *
 * ログイン済み・未ログイン・ログアウト失敗時のトースト表示を確認できます。
 */
const meta = {
  title: "Features/Auth/UserMenu",
  component: UserMenu,
  parameters: {
    layout: "centered",
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
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ログイン済み状態
 *
 * アバターが表示され、クリックでドロップダウンが開きます。
 */
export const LoggedIn: Story = {
  tags: ["vrt"],
  decorators: [
    (Story) => {
      useAuthStore.setState({ user: mockUser, isLoading: false });
      return <Story />;
    },
  ],
};

/**
 * 未ログイン状態
 *
 * ログインボタンが表示されます。
 */
export const LoggedOut: Story = {
  tags: ["vrt"],
  decorators: [
    (Story) => {
      useAuthStore.setState({ user: null, isLoading: false });
      return <Story />;
    },
  ],
};

/**
 * ログアウト失敗時のトースト通知確認
 *
 * ログアウトAPIエラー発生時に toast.error() でエラートーストが表示されることを確認する。
 * Storybook上では toast.error() を直接呼び出してトーストの見た目を確認します。
 */
export const LogoutErrorToast: Story = {
  decorators: [
    (Story) => {
      import("sonner").then(({ toast }) => {
        toast.error("ログアウトに失敗しました。時間をおいて再度お試しください。");
      });
      useAuthStore.setState({ user: mockUser, isLoading: false });
      return <Story />;
    },
  ],
};
