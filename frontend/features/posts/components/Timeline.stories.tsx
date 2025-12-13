import type { Meta, StoryObj } from "@storybook/nextjs";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { Timeline } from "./Timeline";

const mockPosts: GoShishaBackendInternalModelsPost[] = [
  {
    id: 1,
    user_id: 1,
    message: "今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高",
    image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mint",
    likes: 12,
    user: {
      id: 1,
      email: "test@example.com",
      display_name: "テストユーザー",
      description: "シーシャ大好き！",
      icon_url: "",
      external_url: "",
    },
    flavor_id: 1,
    flavor: {
      id: 1,
      name: "ミント",
      color: "bg-green-500",
    },
  },
  {
    id: 2,
    user_id: 2,
    message: "新しいお店を発見！雰囲気も良くて味も抜群でした",
    image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Apple",
    likes: 8,
    user: {
      id: 2,
      email: "shisha@example.com",
      display_name: "シーシャマスター",
      description: "毎日シーシャ吸ってます",
      icon_url: "",
      external_url: "https://twitter.com/shishamaster",
    },
    flavor_id: 2,
    flavor: {
      id: 2,
      name: "アップル",
      color: "bg-red-500",
    },
  },
  {
    id: 3,
    user_id: 1,
    message: "ベリーの酸味がたまらない。ミックスもいいかも。",
    image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Berry",
    likes: 22,
    user: {
      id: 1,
      email: "test@example.com",
      display_name: "テストユーザー",
      description: "シーシャ大好き！",
      icon_url: "",
      external_url: "",
    },
    flavor_id: 3,
    flavor: {
      id: 3,
      name: "ベリー",
      color: "bg-purple-500",
    },
  },
  {
    id: 4,
    user_id: 2,
    message: "マンゴーのトロピカル感が最高！ 夏にぴったり。",
    image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mango",
    likes: 15,
    user: {
      id: 2,
      email: "shisha@example.com",
      display_name: "シーシャマスター",
      description: "毎日シーシャ吸ってます",
      icon_url: "",
      external_url: "https://twitter.com/shishamaster",
    },
    flavor_id: 4,
    flavor: {
      id: 4,
      name: "マンゴー",
      color: "bg-yellow-500",
    },
  },
];

const meta = {
  title: "Features/Posts/Timeline",
  component: Timeline,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs", "vrt"],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのタイムライン表示
 */
export const Default: Story = {
  args: {
    posts: mockPosts,
    isLoading: false,
    error: null,
  },
};

/**
 * ローディング状態
 */
export const Loading: Story = {
  args: {
    posts: [],
    isLoading: true,
    error: null,
  },
};

/**
 * エラー状態
 */
export const Error: Story = {
  args: {
    posts: [],
    isLoading: false,
    error: "データの取得に失敗しました",
  },
};

/**
 * モバイルビューでのタイムライン表示
 */
export const Mobile: Story = {
  args: {
    posts: mockPosts,
    isLoading: false,
    error: null,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
