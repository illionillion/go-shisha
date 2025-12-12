import type { Meta, StoryObj } from "@storybook/nextjs";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { PostCard } from "./PostCard";

const mockPost: GoShishaBackendInternalModelsPost = {
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
};

const mockPostWithoutFlavor: GoShishaBackendInternalModelsPost = {
  id: 2,
  user_id: 2,
  message: "新しいお店を発見！雰囲気も良くて味も抜群でした",
  image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Shisha",
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
  tags: ["autodocs", "vrt"],
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
  args: {
    post: mockPost,
    onLike: () => {},
    onClick: () => {},
  },
};

/**
 * フレーバーなし投稿カード
 */
export const WithoutFlavor: Story = {
  args: {
    post: mockPostWithoutFlavor,
    onLike: () => {},
    onClick: () => {},
  },
};

/**
 * 長いメッセージの投稿カード（line-clamp-3で3行まで表示）
 */
export const LongMessage: Story = {
  args: {
    post: {
      ...mockPost,
      message:
        "この投稿は非常に長いメッセージを含んでいます。シーシャの味わいや雰囲気、お店の詳細など、たくさんの情報を共有したい時に使います。3行を超える部分は省略記号で表示されます。",
    },
    onLike: () => {},
    onClick: () => {},
  },
};

/**
 * 異なるフレーバー（ベリー）
 */
export const BerryFlavor: Story = {
  args: {
    post: {
      ...mockPost,
      id: 3,
      message: "ベリーの酸味がたまらない。ミックスもいいかも。",
      image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Berry",
      likes: 22,
      flavor: {
        id: 3,
        name: "ベリー",
        color: "bg-purple-500",
      },
    },
    onLike: () => {},
    onClick: () => {},
  },
};
