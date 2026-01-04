"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { getImageUrl } from "@/lib/getImageUrl";

type LinkMode = "auto" | "link" | "router";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  /** プロフィールページへ遷移させたい場合は userId を渡す */
  userId?: number | null;
  /** 直接 href を指定することも可能（userId より優先） */
  href?: string | null;
  /** 遷移方法: "link" = <Link>, "router" = router.push, "auto" = router 推奨 */
  linkMode?: LinkMode;
};

export const Avatar: FC<AvatarProps> = ({
  src,
  alt = "ユーザー",
  size = 32,
  className = "",
  userId,
  href,
  linkMode = "auto",
}) => {
  const router = useRouter();
  const px = `${size}px`;
  const targetHref = href ?? (userId ? `/profile/${userId}` : null);

  const inner = src ? (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={alt}
    >
      <Image src={getImageUrl(src)} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </div>
  ) : (
    <div
      className={`rounded-full bg-gray-200 text-gray-500 flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={alt}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="currentColor" />
        <path d="M4 20a8 8 0 0116 0v1H4v-1z" fill="currentColor" />
      </svg>
    </div>
  );

  if (!targetHref) return inner;

  const mode = linkMode === "auto" ? "router" : linkMode;

  if (mode === "link") {
    return (
      <Link href={targetHref} aria-label={alt} className="inline-block">
        {inner}
      </Link>
    );
  }

  const openInNewTab = (url: string) => {
    const newWin = window.open(url, "_blank", "noopener,noreferrer");
    if (newWin) newWin.focus();
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Middle click (button === 1) or modifier keys should open in new tab/window
    if (e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      // Let the browser behavior be approximated by programmatically opening a new tab
      // (button is used so native Ctrl+click won't automatically open a tab).
      openInNewTab(targetHref);
      return;
    }

    // Left click without modifiers -> SPA navigation
    if (e.button === 0) {
      e.preventDefault();
      router.push(targetHref);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter or Space: perform SPA navigation, unless modifier keys are pressed
    if (e.key === "Enter" || e.key === " ") {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        openInNewTab(targetHref as string);
        return;
      }

      e.preventDefault();
      router.push(targetHref);
    }
  };

  return (
    <button
      type="button"
      role="link"
      aria-label={alt}
      className="inline-block"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {inner}
    </button>
  );
};

export default Avatar;
