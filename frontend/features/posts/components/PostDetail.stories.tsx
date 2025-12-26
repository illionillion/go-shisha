import type { Meta, StoryObj } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { GoShishaBackendInternalModelsPost } from "@/api/model";
import PostDetail from "./PostDetail";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockPost: GoShishaBackendInternalModelsPost = {
  id: 1,
  message: "これはサンプルの投稿メッセージです。\n長いテキストは改行されることを確認します。",
  created_at: new Date().toISOString(),
  likes: 12,
  is_liked: false,
  user: {
    id: 10,
    display_name: "テストユーザー",
    icon_url: "/images/sample-avatar.png",
  },
  slides: [
    {
      image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Slide1",
      text: "スライド1のテキスト",
      flavor: { id: 1, name: "Mint" },
    },
    {
      image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Slide2",
      text: "スライド2のテキスト",
      flavor: { id: 2, name: "Grape" },
    },
  ],
} as unknown as GoShishaBackendInternalModelsPost;

const meta = {
  title: "Features/Posts/PostDetail",
  component: PostDetail,
  tags: ["autodocs", "vrt"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof PostDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    postId: 1,
    initialPost: mockPost,
  },
  parameters: {
    viewport: { defaultViewport: "responsive" },
  },
};

export const SingleSlide: Story = {
  args: {
    postId: 2,
    initialPost: {
      ...mockPost,
      id: 2,
      slides: [
        {
          image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mint",
          text: "単一スライド",
          flavor: { id: 3, name: "Vanilla" },
        },
      ],
    } as GoShishaBackendInternalModelsPost,
  },
};
