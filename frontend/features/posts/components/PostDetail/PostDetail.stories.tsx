import type { Meta, StoryObj } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Post } from "@/types/domain";
import PostDetail from "./PostDetail";

// Orval 8.x形式のレスポンスを返すモックデータ用のヘルパー
const createSuccessResponse = <T,>(data: T) => ({
  data,
  status: 200 as const,
  headers: new Headers(),
});

const mockPost: Post = {
  id: 1,
  created_at: new Date().toISOString(),
  likes: 12,
  is_liked: false,
  user: {
    id: 10,
    display_name: "テストユーザー",
    icon_url: "",
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
};

const meta = {
  title: "Features/Posts/PostDetail",
  component: PostDetail,
  tags: ["autodocs", "vrt", "vrt-sp"],
  parameters: {
    layout: "centered",
  },
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
  decorators: [
    (Story) => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      });
      // Orval 8.x形式でキャッシュに設定
      client.setQueryData(["/posts/1"], createSuccessResponse(mockPost));
      return (
        <QueryClientProvider client={client}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
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
    } as Post,
  },
  decorators: [
    (Story, { args }) => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      });
      // Orval 8.x形式でキャッシュに設定
      client.setQueryData([`/posts/${args.postId}`], createSuccessResponse(args.initialPost));
      return (
        <QueryClientProvider client={client}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};
