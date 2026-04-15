"use client";

import { clsx } from "clsx";
import { FocusTrap } from "focus-trap-react";
import { useEffect, useState } from "react";
import { usePostUploadsProfileImages } from "@/api/uploads";
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
 * プロフィール情報（表示名・自己紹介・外部URL）とアバター画像を編集するモーダルUI。
 * アバター画像はクリックでファイル選択→`POST /uploads/profile-images`へアップロードし、
 * 返却されたURLを保存時に`PATCH /users/me`の`icon_url`フィールドへ渡す。
 * API呼び出し・キャッシュ更新・成功トーストを統合する。
 *
 * - `onClose`: 保存成功後に呼ばれる（`useUpdateProfile.onSuccess` 経由）
 * - `onCancel`: ESCキー・バックドロップクリック・キャンセルボタン押下時に呼ばれる
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

  const uploadMut = usePostUploadsProfileImages();
  const [uploadError, setUploadError] = useState<string | undefined>();

  /** アバター画像をアップロードしてURLを返す */
  const handleUploadImage = async (file: File): Promise<string> => {
    setUploadError(undefined);
    const res = await uploadMut.mutateAsync({ data: { image: file } });
    if (res.status === 200 && res.data.url) {
      return res.data.url;
    }
    throw new Error("アップロードに失敗しました");
  };

  const handleSubmit = (input: UpdateUserInput) => {
    onUpdate(input);
  };

  /** Escapeキーでキャンセル（保存中またはアップロード中は無効） */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending && !uploadMut.isPending) {
        e.preventDefault();
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPending, uploadMut.isPending, onCancel]);

  const isProcessing = isPending || uploadMut.isPending;

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
        {/* バックドロップ: クリックでキャンセル（処理中は無効） */}
        <div
          className={clsx(["fixed", "inset-0", "bg-black/50"])}
          onClick={() => {
            if (!isProcessing) onCancel?.();
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
            onUploadImage={handleUploadImage}
            isUploading={uploadMut.isPending}
            uploadError={
              uploadMut.isError || uploadError ? "画像のアップロードに失敗しました" : undefined
            }
          />
        </div>
      </div>
    </FocusTrap>
  );
}

export type { EditProfileFormProps };
