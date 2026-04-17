"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { EditProfileModal } from "../EditProfileModal";

export type ProfileHeaderContainerProps = {
  /** 表示対象ユーザーのID */
  userId: number;
  /** 表示名 */
  displayName?: string | null;
  /** アイコン画像URL */
  iconUrl?: string | null;
  /** 自己紹介 */
  bio?: string | null;
  /** 外部URL */
  externalUrl?: string | null;
};

/**
 * プロフィールヘッダーコンテナ
 *
 * 自分のプロフィールページにのみ「プロフィールを編集」ボタンを表示し、
 * 編集モーダルを開くクライアントコンポーネント。
 *
 * @example
 * ```tsx
 * <ProfileHeaderContainer
 *   userId={user.id}
 *   displayName={user.display_name}
 *   iconUrl={user.icon_url}
 *   bio={user.description}
 *   externalUrl={user.external_url}
 * />
 * ```
 */
export function ProfileHeaderContainer({
  userId,
  displayName,
  iconUrl,
  bio,
  externalUrl,
}: ProfileHeaderContainerProps) {
  const { user: currentUser } = useAuthStore();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOwner = currentUser?.id != null && currentUser.id === userId;

  const handleClose = () => {
    // 保存成功時（useUpdateProfileのonSuccessから呼ばれる）: モーダルを閉じてページをリフレッシュし最新データを反映する
    setIsEditOpen(false);
    router.refresh();
  };

  const handleCancel = () => {
    // キャンセル時: モーダルを閉じるだけ（サーバーデータの変更なし）
    setIsEditOpen(false);
  };

  return (
    <>
      <ProfileHeader
        displayName={displayName}
        iconUrl={iconUrl}
        bio={bio}
        externalUrl={externalUrl}
        onEditClick={isOwner ? () => setIsEditOpen(true) : undefined}
      />

      {isEditOpen && (
        <EditProfileModal
          userId={userId}
          initialUser={{
            display_name: displayName ?? undefined,
            description: bio ?? undefined,
            external_url: externalUrl ?? undefined,
            icon_url: iconUrl ?? undefined,
          }}
          onClose={handleClose}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
