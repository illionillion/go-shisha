import type { Meta, StoryObj } from "@storybook/nextjs";
import { useEffect } from "react";
import { toast } from "sonner";
import type { Flavor } from "@/types/domain";
import { PostDetailFooter } from "./PostDetailFooter";

const mockFlavor: Flavor = {
  id: 1,
  name: "ダブルアップル",
  color: "bg-red-500",
};

/**
 * 投稿詳細フッターコンポーネントのStory
 *
 * いいね・シェアボタンの表示と操作、URLコピー成功時のトースト通知を確認できます。
 */
const meta = {
  title: "Features/Posts/PostDetailFooter",
  component: PostDetailFooter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    optimisticLikes: 5,
    isLiked: false,
    onLike: () => {},
  },
} satisfies Meta<typeof PostDetailFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（未いいね）
 */
export const Default: Story = {
  tags: ["vrt"],
  args: {
    currentSlide: {
      text: "シーシャの感想を書きました。とても美味しかったです！",
      flavor: mockFlavor,
    },
    isLiked: false,
    optimisticLikes: 5,
  },
};

/**
 * いいね済み状態
 */
export const Liked: Story = {
  tags: ["vrt"],
  args: {
    currentSlide: {
      text: "シーシャの感想を書きました。とても美味しかったです！",
      flavor: mockFlavor,
    },
    isLiked: true,
    optimisticLikes: 6,
  },
};

/**
 * URLコピー成功時のトースト通知確認
 *
 * シェアボタン押下後に toast.success() が表示されることを確認する。
 * Storybook上ではトーストを直接発火して見た目を確認します。
 */
export const ShareSuccessToast: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const id = toast.success("URLをコピーしました");
        return () => {
          toast.dismiss(id);
        };
      }, []);
      return <Story />;
    },
  ],
  args: {
    currentSlide: {
      text: "シーシャの感想を書きました。とても美味しかったです！",
      flavor: mockFlavor,
    },
    isLiked: false,
    optimisticLikes: 5,
  },
};
