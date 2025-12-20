import type { Meta, StoryObj } from "@storybook/nextjs";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { PostCard } from "./PostCard";

const mockPost: GoShishaBackendInternalModelsPost = {
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
};

const mockPostWithoutFlavor: GoShishaBackendInternalModelsPost = {
  id: 2,
  user_id: 2,
  message: "新しいお店を発見！雰囲気も良くて味も抜群でした",
  slides: [
    {
      image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Shisha",
      text: "新しいお店を発見！雰囲気も良くて味も抜群でした",
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
};

const meta = {
  title: "Features/Posts/PostCard",
  component: PostCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    post: {
      description: "投稿データ",
    },
    onLike: {
      action: "liked",
    },
    onClick: {
      action: "clicked",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * フレーバー付き投稿カード
 */
export const WithFlavor: Story = {
  tags: ["vrt"],
  args: {
    post: mockPost,
    onLike: () => {},
    onClick: () => {},
    tick: 0,
  },
};

/**
 * フレーバーなし投稿カード
 */
export const WithoutFlavor: Story = {
  tags: ["vrt"],
  args: {
    post: mockPostWithoutFlavor,
    onLike: () => {},
    onClick: () => {},
    tick: 0,
  },
};

/**
 * 長いメッセージの投稿カード（line-clamp-3で3行まで表示）
 */
export const LongMessage: Story = {
  tags: ["vrt"],
  args: {
    post: {
      ...mockPost,
      slides: [
        {
          image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mint",
          text: "この投稿は非常に長いメッセージを含んでいます。シーシャの味わいや雰囲気、お店の詳細など、たくさんの情報を共有したい時に使います。3行を超える部分は省略記号で表示されます。",
          flavor: {
            id: 1,
            name: "ミント",
            color: "bg-green-500",
          },
        },
      ],
    },
    onLike: () => {},
    onClick: () => {},
    tick: 0,
  },
};

/**
 * 異なるフレーバー（ベリー）
 */
export const BerryFlavor: Story = {
  tags: ["vrt"],
  args: {
    post: {
      ...mockPost,
      id: 3,
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
    },
    onLike: () => {},
    onClick: () => {},
    tick: 0,
  },
};

/**
 * 画像なし投稿カード（フォールバック画像表示）
 */
export const WithoutImage: Story = {
  tags: ["vrt"],
  args: {
    post: {
      ...mockPost,
      id: 4,
      message: "画像なしの投稿です。フォールバック画像が表示されます。",
      slides: [
        {
          image_url: undefined,
          text: "画像なしの投稿です。フォールバック画像が表示されます。",
        },
      ],
      likes: 5,
    },
    onLike: () => {},
    onClick: () => {},
    tick: 0,
  },
};

/**
 * 複数画像スライド（3枚）
 * ⚠️ VRT対象外: CSS Animationによるプログレスバーが含まれるため不安定
 */
export const MultipleSlides: Story = {
  args: {
    post: {
      id: 5,
      user_id: 1,
      message: "複数画像スライド",
      slides: [
        {
          image_url: "https://placehold.co/400x600/4CAF50/FFFFFF?text=Slide+1+Mint",
          text: "1枚目：爽やかなミント系",
          flavor: {
            id: 1,
            name: "ミント",
            color: "bg-green-500",
          },
        },
        {
          image_url: "https://placehold.co/400x600/9C27B0/FFFFFF?text=Slide+2+Berry",
          text: "2枚目：甘酸っぱいベリー系",
          flavor: {
            id: 3,
            name: "ベリー",
            color: "bg-purple-500",
          },
        },
        {
          image_url: "https://placehold.co/400x600/FF9800/FFFFFF?text=Slide+3+Orange",
          text: "3枚目：フルーティーなオレンジ",
          flavor: {
            id: 5,
            name: "オレンジ",
            color: "bg-orange-500",
          },
        },
      ],
      likes: 42,
      user: {
        id: 1,
        email: "test@example.com",
        display_name: "テストユーザー",
        description: "シーシャ大好き！",
        icon_url: "",
        external_url: "",
      },
    },
    onLike: () => {},
    onClick: () => {},
    tick: 0,
  },
};

/**
 * 複数画像スライド（5枚）
 * ⚠️ VRT対象外: CSS Animationによるプログレスバーが含まれるため不安定
 */
export const FiveSlides: Story = {
  args: {
    post: {
      id: 6,
      user_id: 1,
      message: "5枚の画像スライド",
      slides: [
        {
          image_url: "https://placehold.co/400x600/4CAF50/FFFFFF?text=1",
          text: "1枚目",
        },
        {
          image_url: "https://placehold.co/400x600/2196F3/FFFFFF?text=2",
          text: "2枚目",
        },
        {
          image_url: "https://placehold.co/400x600/9C27B0/FFFFFF?text=3",
          text: "3枚目",
        },
        {
          image_url: "https://placehold.co/400x600/FF9800/FFFFFF?text=4",
          text: "4枚目",
        },
        {
          image_url: "https://placehold.co/400x600/F44336/FFFFFF?text=5",
          text: "5枚目",
        },
      ],
      likes: 100,
      user: {
        id: 1,
        email: "test@example.com",
        display_name: "テストユーザー",
        description: "シーシャ大好き！",
        icon_url: "",
        external_url: "",
      },
    },
    onLike: () => {},
    onClick: () => {},
    tick: 0,
  },
};

/**
 * プログレスバー静止状態（VRT用）
 * 複数スライドの初期状態（1枚目表示、プログレスバー表示）
 * CSS Animationを完全に無効化してプログレスバーのレイアウトをVRTでテスト
 */
export const ProgressBarStatic: Story = {
  tags: ["vrt"],
  args: {
    post: {
      id: 7,
      user_id: 1,
      message: "プログレスバー表示確認（VRT用）",
      slides: [
        {
          image_url: "https://placehold.co/400x600/4CAF50/FFFFFF?text=1",
          text: "1枚目：プログレスバー確認",
          flavor: {
            id: 1,
            name: "ミント",
            color: "bg-green-500",
          },
        },
        {
          image_url: "https://placehold.co/400x600/2196F3/FFFFFF?text=2",
          text: "2枚目",
          flavor: {
            id: 2,
            name: "ベリー",
            color: "bg-purple-500",
          },
        },
        {
          image_url: "https://placehold.co/400x600/9C27B0/FFFFFF?text=3",
          text: "3枚目",
          flavor: {
            id: 3,
            name: "オレンジ",
            color: "bg-orange-500",
          },
        },
      ],
      likes: 77,
    },
    autoPlayInterval: 3000,
    onLike: () => {},
    onClick: () => {},
    tick: 0, // 必須プロパティを追加
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <style>
          {`
            /* VRT用: CSS Animationを完全停止 */
            * {
              animation-play-state: paused !important;
              animation-duration: 0s !important;
            }
          `}
        </style>
        <Story />
      </div>
    ),
  ],
  parameters: {
    // アニメーションは停止しているので、レンダリング完了のみ待つ
    chromatic: { delay: 100 },
  },
};
