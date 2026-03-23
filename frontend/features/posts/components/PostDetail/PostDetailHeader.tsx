"use client";

import { clsx } from "clsx";
import { Avatar } from "@/components/Avatar/Avatar";
import { PrevIcon } from "@/components/icons/";
import { formatDate } from "@/lib/formatDate";
import { PostOwnerMenu } from "../PostOwnerMenu";

interface Props {
  userDisplayName?: string | null;
  userIconUrl?: string | null;
  userId?: number;
  createdAt?: string;
  onBack: () => void;
  /** 自分の投稿の場合のみ渡す削除コールバック */
  onDelete?: () => void;
  /** 自分の投稿の場合のみ渡す編集コールバック */
  onEdit?: () => void;
}

export function PostDetailHeader({
  userDisplayName,
  userIconUrl,
  userId,
  createdAt,
  onBack,
  onDelete,
  onEdit,
}: Props) {
  return (
    <>
      <div className={clsx(["hidden", "md:flex", "items-center", "gap-3", "mb-3"])}>
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          className={clsx([
            "inline-flex",
            "items-center",
            "gap-2",
            "text-sm",
            "text-gray-700",
            "focus:outline-none",
          ])}
        >
          <PrevIcon className={clsx(["w-4", "h-4", "text-black"])} />
          <span>戻る</span>
        </button>
      </div>

      <div className={clsx(["relative", "flex", "items-center", "gap-3", "mb-3"])}>
        <Avatar
          src={userIconUrl ?? null}
          alt={userDisplayName || "ユーザー"}
          size={40}
          userId={userId}
          linkMode="link"
        />
        <div className={clsx(["flex-1"])}>
          <div className={clsx(["font-medium"])}>{userDisplayName || "匿名"}</div>
          <div className={clsx(["text-sm", "text-gray-500"])}>
            <time dateTime={createdAt ? createdAt : undefined}>{formatDate(createdAt)}</time>
          </div>
        </div>

        {/* 3点リーダーメニュー（投稿者のみ表示） */}
        {onDelete && <PostOwnerMenu onDelete={onDelete} onEdit={onEdit} />}
      </div>
    </>
  );
}

export default PostDetailHeader;
