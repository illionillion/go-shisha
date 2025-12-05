import type { Meta, StoryObj } from "@storybook/nextjs";
import { ShishaCard } from "./ShishaCard";

/**
 * ShishaCardはシーシャ投稿を表示するカードコンポーネントです。
 *
 * ## 使用例
 * - フィード画面での投稿表示
 * - グリッドレイアウトでの一覧表示
 */
const meta = {
  title: "UI/ShishaCard",
  component: ShishaCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact"],
      description: "カードのサイズバリアント",
    },
    likes: {
      control: "number",
      description: "いいね数",
    },
  },
} satisfies Meta<typeof ShishaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのShishaCard表示
 */
export const Default: Story = {
  args: {
    imageUrl: "https://via.placeholder.com/300x400/CCCCCC/666666?text=Shisha",
    message: "今日のシーシャは最高でした！フルーツミックスの味が絶妙で、煙もたっぷり楽しめました。",
    likes: 42,
    user: {
      displayName: "山田太郎",
      iconUrl: "https://via.placeholder.com/40/4A90E2/FFFFFF?text=YT",
    },
    variant: "default",
  },
};

/**
 * コンパクトバリアント
 */
export const Compact: Story = {
  args: {
    imageUrl: "https://via.placeholder.com/300x400/AAAAAA/555555?text=Shisha",
    message: "新しいフレーバーを試してみました！",
    likes: 15,
    user: {
      displayName: "佐藤花子",
      iconUrl: "https://via.placeholder.com/40/E74C3C/FFFFFF?text=SH",
    },
    variant: "compact",
  },
};

/**
 * アイコンなしユーザー
 */
export const WithoutUserIcon: Story = {
  args: {
    imageUrl: "https://via.placeholder.com/300x400/999999/444444?text=Shisha",
    message: "リラックスタイム🌙",
    likes: 128,
    user: {
      displayName: "鈴木一郎",
    },
    variant: "default",
  },
};

/**
 * いいね数が多い投稿
 */
export const PopularPost: Story = {
  args: {
    imageUrl: "https://via.placeholder.com/300x400/BBBBBB/555555?text=Popular",
    message: "超人気店で撮影！この組み合わせは本当におすすめです。みんなもぜひ試してみてください！",
    likes: 9999,
    user: {
      displayName: "田中美咲",
      iconUrl: "https://via.placeholder.com/40/1ABC9C/FFFFFF?text=TM",
    },
    variant: "default",
  },
};

/**
 * 短いメッセージ
 */
export const ShortMessage: Story = {
  args: {
    imageUrl: "https://via.placeholder.com/300x400/DDDDDD/666666?text=Shisha",
    message: "最高！",
    likes: 7,
    user: {
      displayName: "高橋健",
      iconUrl: "https://via.placeholder.com/40/16A085/FFFFFF?text=TK",
    },
    variant: "default",
  },
};

/**
 * クリックハンドラ付き
 */
export const WithClickHandler: Story = {
  args: {
    imageUrl: "https://via.placeholder.com/300x400/888888/333333?text=Click+Me",
    message: "クリックしてみてください！",
    likes: 25,
    user: {
      displayName: "中村由美",
      iconUrl: "https://via.placeholder.com/40/8E44AD/FFFFFF?text=NY",
    },
    variant: "default",
    onClick: () => alert("カードがクリックされました！"),
  },
};
