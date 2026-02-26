import type { Meta, StoryObj } from "@storybook/nextjs";
import { useEffect } from "react";
import { useConfirmStore } from "@/lib/confirm-store";
import { ConfirmDialog } from "./ConfirmDialog";

const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ダイアログが開いた状態
 */
export const Open: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useConfirmStore.setState({
          isOpen: true,
          message: "入力中の内容が破棄されます。閉じてもよいですか？",
          resolve: null,
        });
        return () => {
          useConfirmStore.setState({ isOpen: false, message: "", resolve: null });
        };
      }, []);
      return <Story />;
    },
  ],
};

/**
 * ダイアログが閉じた状態（何も表示されない）
 */
export const Closed: Story = {};

/**
 * 長いメッセージ
 */
export const LongMessage: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useConfirmStore.setState({
          isOpen: true,
          message:
            "この操作は取り消すことができません。\n本当に削除してもよいですか？\n削除されたデータは復元できません。",
          resolve: null,
        });
        return () => {
          useConfirmStore.setState({ isOpen: false, message: "", resolve: null });
        };
      }, []);
      return <Story />;
    },
  ],
};
