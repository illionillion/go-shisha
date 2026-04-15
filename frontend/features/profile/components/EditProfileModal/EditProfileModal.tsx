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
  /** 保存成功後にモーダルを閉じるコールバック */
  onClose: () => void;
};

/**
 * プロフィール編集モーダル
 *
 * プロフィール情報（表示名・自己紹介・外部URL・アイコン画像URL）を編集するモーダルUI。
 * API呼び出し・キャッシュ更新・成功トーストを統合する。
 *
 * - `onClose`: 保存成功後に呼ばれる（`useUpdateProfile.onSuccess` 経由）
 * - `onCancel`: ESCキー・バックドロップクリック・キャンセルボタン押下時に呼ばれる
 *
 * @example
 * ```tsx
 * <EditProfileModal
 *   userId={user.id}
 *   initialUser={user}
 *   onClose={() => { setIsEditOpen(false); router.refresh(); }}
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

  /** Escapeキーでキャンセル（保存中は無効） */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        e.preventDefault();
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPending, onCancel]);

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
        {/* バックドロップ: クリックでキャンセル（保存中は無効） */}
        <div
          className={clsx(["fixed", "inset-0", "bg-black/50"])}
          onClick={() => {
            if (!isPending) onCancel?.();
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
