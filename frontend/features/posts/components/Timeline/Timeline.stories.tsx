import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Flavor, Post } from "@/types/domain";
import { Timeline } from "./Timeline";

const mockFlavors: Flavor[] = [
  { id: 1, name: "ミント", color: "bg-green-500" },
  { id: 2, name: "アップル", color: "bg-red-500" },
  { id: 3, name: "ベリー", color: "bg-purple-500" },
  { id: 4, name: "マンゴー", color: "bg-yellow-500" },
];

const mockPosts: Post[] = [
  {
    id: 1,
    user_id: 1,
    message: "今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高",
    slides: [
      {
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mint",
        text: "今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高",
        flavor: {
          id: 1,
          name: "ミント",
          color: "bg-green-500",
        },
      },
    ],
    likes: 12,
    user: {
      id: 1,
      email: "test@example.com",
      display_name: "テストユーザー",
      description: "シーシャ大好き！",
      icon_url: "",
      external_url: "",
    },
  },
  {
    id: 2,
    user_id: 2,
    message: "新しいお店を発見！雰囲気も良くて味も抜群でした",
    slides: [
      {
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Apple",
        text: "新しいお店を発見！雰囲気も良くて味も抜群でした",
        flavor: {
          id: 2,
          name: "アップル",
          color: "bg-red-500",
        },
      },
    ],
    likes: 8,
    user: {
      id: 2,
      email: "shisha@example.com",
      display_name: "シーシャマスター",
      description: "毎日シーシャ吸ってます",
      icon_url: "",
      external_url: "https://twitter.com/shishamaster",
    },
  },
  {
    id: 3,
    user_id: 1,
    message: "ベリーの酸味がたまらない。ミックスもいいかも。",
    slides: [
      {
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Berry",
        text: "ベリーの酸味がたまらない。ミックスもいいかも。",
        flavor: {
          id: 3,
          name: "ベリー",
          color: "bg-purple-500",
        },
      },
    ],
    likes: 22,
    user: {
      id: 1,
      email: "test@example.com",
      display_name: "テストユーザー",
      description: "シーシャ大好き！",
      icon_url: "",
      external_url: "",
    },
  },
  {
    id: 4,
    user_id: 2,
    message: "マンゴーのトロピカル感が最高！ 夏にぴったり。",
    slides: [
      {
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mango",
        text: "マンゴーのトロピカル感が最高！ 夏にぴったり。",
        flavor: {
          id: 4,
          name: "マンゴー",
          color: "bg-yellow-500",
        },
      },
    ],
    likes: 15,
    user: {
      id: 2,
      email: "shisha@example.com",
      display_name: "シーシャマスター",
      description: "毎日シーシャ吸ってます",
      icon_url: "",
      external_url: "https://twitter.com/shishamaster",
    },
  },
];

const meta = {
  title: "Features/Posts/Timeline",
  component: Timeline,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    posts: {
      description: "投稿一覧",
    },
    isLoading: {
      description: "ローディング状態",
    },
    error: {
      description: "エラー",
    },
    availableFlavors: {
      description: "利用可能なフレーバー一覧",
    },
    selectedFlavorIds: {
      description: "選択中のフレーバーID配列",
    },
    onFlavorToggle: {
      action: "flavor toggled",
      description: "フレーバー選択切り替えハンドラー",
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのタイムライン表示
 */
export const Default: Story = {
  tags: ["vrt", "vrt-sp"],
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
  tags: ["vrt"],
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
  tags: ["vrt"],
  args: {
    posts: [],
    isLoading: false,
    error: "データの取得に失敗しました",
  },
};

/**
 * フレーバーフィルター付き（インタラクティブ）
 * フィルター選択に応じてタイムラインの投稿が絞り込まれる
 */
export const WithFlavorFilterInteractive: Story = {
  tags: ["vrt", "vrt-sp"],
  args: {
    posts: mockPosts,
    isLoading: false,
    error: null,
    availableFlavors: mockFlavors,
    selectedFlavorIds: [],
    onFlavorToggle: () => {},
  },
};

/**
 * フレーバーフィルター付き（初期選択あり）
 * ミントとベリーが選択された状態
 */
export const WithFlavorFilterPreselected: Story = {
  tags: ["vrt", "vrt-sp"],
  args: {
    posts: mockPosts.filter((post) => {
      const firstSlide = post.slides?.[0];
      return firstSlide?.flavor?.id === 1 || firstSlide?.flavor?.id === 3;
    }),
    isLoading: false,
    error: null,
    availableFlavors: mockFlavors,
    selectedFlavorIds: [1, 3],
    onFlavorToggle: () => {},
  },
};
