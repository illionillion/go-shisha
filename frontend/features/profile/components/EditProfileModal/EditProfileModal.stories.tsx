import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditProfileModal } from "./EditProfileModal";

/** QueryClientを生成するヘルパー */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const meta = {
  title: "Features/Profile/EditProfileModal",
  component: EditProfileModal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs", "vrt"],
  decorators: [
    (Story) => {
      const queryClient = createQueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof EditProfileModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト（既存データを編集）
 */
export const Default: Story = {
  args: {
    userId: 1,
    initialUser: {
      display_name: "山田 太郎",
      description: "シーシャ好きのエンジニア\n週末はカフェ巡りをしています。",
      external_url: "https://example.com",
      icon_url: "",
    },
    onClose: () => {},
    onCancel: () => {},
  },
};

/**
 * 空のフォーム（新規設定）
 */
export const Empty: Story = {
  args: {
    userId: 1,
    initialUser: {
      display_name: undefined,
      description: undefined,
      external_url: undefined,
      icon_url: undefined,
    },
    onClose: () => {},
    onCancel: () => {},
  },
};
