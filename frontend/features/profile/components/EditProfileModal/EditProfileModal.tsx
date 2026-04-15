"use client";

import { clsx } from "clsx";
import { FocusTrap } from "focus-trap-react";
import { useEffect } from "react";
import type { UpdateUserInput } from "@/types/domain";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import type { EditProfileFormProps } from "./EditProfileForm";
import { EditProfileForm } from "./EditProfileForm";

export type EditProfileModalProps = Omit<EditProfileFormProps, "onSubmit" | "disabled"> & {
  /** 更新対象ユーザーのID */
  userId: number;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
};

/**
 * プロフィール編集モーダル
 *
 * プロフィール情報（表示名・自己紹介・外部URL・アイコン画像URL）を編集するモーダルUI。
 * API呼び出し・キャッシュ更新・成功トーストを統合する。
 *
 * @example
 * ```tsx
 * <EditProfileModal
 *   userId={user.id}
 *   initialUser={user}
 *   onClose={() => setIsEditOpen(false)}
 *   onCancel={() => setIsEditOpen(false)}
 * />
 * ```
 */
export function EditProfileModal({
  userId,
  initialUser,
  onClose,
  onCancel,
}: EditProfileModalProps) {
  const { onUpdate, isPending } = useUpdateProfile({
    userId,
    onSuccess: onClose,
  });

  const handleSubmit = (input: UpdateUserInput) => {
    onUpdate(input);
  };

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
        aria-label="プロフィール編集"
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
            "sm:max-w-lg",
            "max-h-[90vh]",
            "bg-white",
            "rounded-t-2xl",
            "sm:rounded-xl",
            "overflow-hidden",
            "flex",
            "flex-col",
          ])}
        >
          <EditProfileForm
            initialUser={initialUser}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            disabled={isPending}
          />
        </div>
      </div>
    </FocusTrap>
  );
}

export type { EditProfileFormProps };
