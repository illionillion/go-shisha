import clsx from "clsx";
import { PlusIcon } from "@/components/icons";

export type PostCreateFABProps = {
  onClick: () => void;
  "aria-label"?: string;
};

/**
 * 投稿作成用フローティングアクションボタン
 *
 * 画面右下に固定表示され、クリックで投稿作成モーダルを開く
 *
 * @example
 * ```tsx
 * <PostCreateFAB onClick={() => setIsModalOpen(true)} />
 * ```
 */
export function PostCreateFAB({
  onClick,
  "aria-label": ariaLabel = "投稿作成",
}: PostCreateFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx([
        "fixed",
        "bottom-20",
        "right-6",
        "z-50",
        "flex",
        "h-14",
        "w-14",
        "items-center",
        "justify-center",
        "rounded-full",
        "bg-blue-600",
        "text-white",
        "shadow-lg",
        "transition-all",
        "hover:bg-blue-700",
        "hover:shadow-xl",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "active:scale-95",
      ])}
    >
      <PlusIcon className={clsx(["h-6", "w-6"])} />
    </button>
  );
}
