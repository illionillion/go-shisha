"use client";
import { clsx } from "clsx";
import { FocusTrap } from "focus-trap-react";
import { useEffect } from "react";
import { getFlavorsData, useGetFlavors } from "../../hooks/useGetFlavors";
import { useUpdatePost } from "../../hooks/useUpdatePost";
import type { EditPostFormProps } from "./EditPostForm";
import { EditPostForm } from "./EditPostForm";

export type EditPostModalProps = Omit<EditPostFormProps, "flavors" | "onSubmit"> & {
  /** モーダルを閉じるコールバック */
  onClose: () => void;
};

/**
 * 投稿編集モーダル
 *
 * 既存投稿のテキスト・フレーバーを編集するモーダルUI。
 * フレーバー取得・API呼び出し・キャッシュ更新を統合する。
 *
 * @example
 * ```tsx
 * <EditPostModal
 *   postId={post.id}
 *   slides={post.slides}
 *   onClose={() => setIsEditOpen(false)}
 *   onCancel={() => setIsEditOpen(false)}
 * />
 * ```
 */
export function EditPostModal({ postId, slides, onClose, onCancel, disabled }: EditPostModalProps) {
  const flavorsQuery = useGetFlavors();
  const flavors = getFlavorsData(flavorsQuery);

  const { onUpdate, isPending } = useUpdatePost({
    onSuccess: onClose,
  });

  /** Escapeキーでモーダルを閉じる */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPending, onClose]);

  return (
    <FocusTrap
      active
      focusTrapOptions={{
        escapeDeactivates: false,
      }}
    >
      <div
        className={clsx([
          "fixed",
          "inset-0",
          "z-50",
          "flex",
          "items-end",
          "sm:items-center",
          "justify-center",
        ])}
        role="dialog"
        aria-modal="true"
        aria-label="投稿編集"
      >
        {/* バックドロップ */}
        <div
          className={clsx(["fixed", "inset-0", "bg-black/50"])}
          onClick={() => {
            if (!isPending) onClose();
          }}
          aria-hidden="true"
        />

        {/* モーダルパネル */}
        <div
          className={clsx([
            "relative",
            "w-full",
            "sm:max-w-2xl",
            "h-[90vh]",
            "sm:max-h-[90vh]",
            "bg-white",
            "rounded-t-2xl",
            "sm:rounded-xl",
            "overflow-hidden",
            "flex",
            "flex-col",
          ])}
        >
          <EditPostForm
            postId={postId}
            slides={slides}
            flavors={flavors ?? []}
            onSubmit={onUpdate}
            onCancel={onCancel}
            disabled={isPending || !!disabled}
          />
        </div>
      </div>
    </FocusTrap>
  );
}
