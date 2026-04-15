import { clsx } from "clsx";
import Link from "next/link";
import type { FC } from "react";
import { Avatar } from "../Avatar";

interface Props {
  displayName?: string | null;
  iconUrl?: string | null;
  bio?: string | null;
  externalUrl?: string | null;
  /** 編集ボタンクリック時のコールバック。指定時のみ編集ボタンを表示する */
  onEditClick?: () => void;
}

/**
 * ProfileHeader
 * - プロフィールヘッダー
 * - `onEditClick` を渡すと「プロフィールを編集」ボタンを表示する
 */
export const ProfileHeader: FC<Props> = ({
  displayName,
  iconUrl,
  bio: bioText,
  externalUrl,
  onEditClick,
}) => {
  const name = displayName || "名無しのユーザー";
  const bio = bioText ?? "";
  const external = externalUrl ?? null;

  return (
    <div className={clsx(["w-full", "bg-white", "border-b", "border-gray-100"])}>
      <div
        className={clsx([
          "max-w-3xl",
          "mx-auto",
          "px-4",
          "py-6",
          "flex",
          "items-start",
          "space-x-4",
        ])}
      >
        <Avatar src={iconUrl ?? null} alt={name} size={80} className={clsx(["flex-shrink-0"])} />
        <div className={clsx(["flex-1"])}>
          <div className={clsx(["flex", "items-center", "justify-between"])}>
            <h2 className={clsx(["text-2xl", "font-semibold", "text-gray-900"])}>{name}</h2>
            {onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className={clsx([
                  "text-sm",
                  "font-medium",
                  "text-purple-600",
                  "hover:text-purple-700",
                  "border",
                  "border-purple-300",
                  "rounded-md",
                  "px-3",
                  "py-1.5",
                  "hover:bg-purple-50",
                  "transition-colors",
                ])}
              >
                プロフィールを編集
              </button>
            )}
          </div>
          {bio && (
            <p className={clsx(["mt-2", "text-sm", "text-gray-700", "whitespace-pre-wrap"])}>
              {bio}
            </p>
          )}
          {external && (
            <p className={clsx(["mt-3"])}>
              <Link
                href={external}
                className={clsx(["text-sm", "text-blue-600", "hover:underline"])}
                target="_blank"
                rel="noopener noreferrer"
              >
                {external}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
