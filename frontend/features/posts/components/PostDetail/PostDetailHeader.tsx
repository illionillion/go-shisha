"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar/Avatar";
import { PrevIcon } from "@/components/icons/";
import { formatDate } from "@/lib/formatDate";
import type { User } from "@/types/domain";

interface Props {
  user?: User;
  createdAt?: string | undefined;
  onBack: () => void;
  /** 自分の投稿の場合のみ渡す削除コールバック */
  onDelete?: () => void;
}

export function PostDetailHeader({ user, createdAt, onBack, onDelete }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /** メニュー外クリックおよびESCキーで閉じる */
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

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
          src={user?.icon_url ?? null}
          alt={user?.display_name ?? "ユーザー"}
          size={40}
          userId={user?.id}
          linkMode="link"
        />
        <div className={clsx(["flex-1"])}>
          <div className={clsx(["font-medium"])}>{user?.display_name || "匿名"}</div>
          <div className={clsx(["text-sm", "text-gray-500"])}>
            <time dateTime={createdAt ?? undefined}>{formatDate(createdAt)}</time>
          </div>
        </div>

        {/* 3点リーダーメニュー（投稿者のみ表示） */}
        {onDelete && (
          <div ref={menuRef} className={clsx(["relative"])}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="メニュー"
              aria-expanded={isMenuOpen}
              className={clsx([
                "p-1",
                "rounded",
                "text-gray-500",
                "hover:bg-gray-100",
                "focus:outline-none",
              ])}
            >
              <svg
                className={clsx(["w-5", "h-5"])}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {isMenuOpen && (
              <div
                className={clsx([
                  "absolute",
                  "right-0",
                  "mt-1",
                  "w-28",
                  "bg-white",
                  "rounded-lg",
                  "shadow-lg",
                  "overflow-hidden",
                  "z-10",
                ])}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete();
                  }}
                  className={clsx([
                    "w-full",
                    "px-4",
                    "py-2",
                    "text-sm",
                    "text-left",
                    "text-red-600",
                    "hover:bg-red-50",
                    "transition-colors",
                  ])}
                >
                  削除
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default PostDetailHeader;
