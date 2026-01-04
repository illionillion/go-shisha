"use client";

import { Avatar } from "@/components/Avatar/Avatar";
import { PrevIcon } from "@/components/icons/";
import type { User } from "@/types/domain";

interface Props {
  user?: User;
  createdAt?: string | undefined;
  onBack: () => void;
}

export function PostDetailHeader({ user, createdAt, onBack }: Props) {
  return (
    <>
      <div className="hidden md:flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          className="inline-flex items-center gap-2 text-sm text-gray-700 focus:outline-none"
        >
          <PrevIcon className="w-4 h-4 text-black" />
          <span>戻る</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Avatar
          src={user?.icon_url ?? null}
          alt={user?.display_name ?? "ユーザー"}
          size={40}
          userId={user?.id}
          linkMode="link"
        />
        <div>
          <div className="font-medium">{user?.display_name || "匿名"}</div>
          <div className="text-sm text-gray-500">
            <time dateTime={createdAt ?? undefined}>{createdAt ?? ""}</time>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetailHeader;
