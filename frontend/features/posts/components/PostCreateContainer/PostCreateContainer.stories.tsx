import type { Meta, StoryObj } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getGetFlavorsQueryKey } from "@/api/flavors";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { Flavor, User } from "@/types/domain";
import { PostCreateContainer } from "./PostCreateContainer";

const mockUser: User = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "",
  description: "テストユーザーです",
};

const mockFlavors: Flavor[] = [
  { id: 1, name: "ミント", color: "bg-green-500" },
  { id: 2, name: "アップル", color: "bg-red-500" },
  { id: 3, name: "ベリー", color: "bg-purple-500" },
  { id: 4, name: "マンゴー", color: "bg-yellow-500" },
  { id: 5, name: "オレンジ", color: "bg-orange-500" },
  { id: 6, name: "グレープ", color: "bg-indigo-500" },
];

/** フレーバーをキャッシュに事前投入したQueryClientを生成するヘルパー */
function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(getGetFlavorsQueryKey(), {
    status: 200,
    data: mockFlavors,
    headers: new Headers(),
  });
  return queryClient;
}

const meta = {
  title: "Features/Posts/PostCreateContainer",
  component: PostCreateContainer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const queryClient = createQueryClient();
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
