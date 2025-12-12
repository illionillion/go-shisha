"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import Image from "next/image";
import { useState } from "react";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";

interface PostCardProps {
  post: GoShishaBackendInternalModelsPost;
  onLike: (postId: number) => void;
  onClick: (post: GoShishaBackendInternalModelsPost) => void;
}

const cardVariants = cva(["relative", "cursor-pointer", "group"], {
  variants: {},
});

const imageContainerVariants = cva(["aspect-[2/3]", "relative", "overflow-hidden", "rounded-lg"], {
  variants: {},
});

const overlayVariants = cva(
  ["absolute", "inset-0", "bg-gradient-to-t", "from-black/60", "via-transparent", "to-transparent"],
  {
    variants: {},
  }
);

const likeButtonVariants = cva(
  [
    "absolute",
    "top-4",
    "right-4",
    "p-2",
    "rounded-full",
    "bg-white/20",
    "backdrop-blur-sm",
    "hover:bg-white/30",
    "transition-colors",
  ],
  {
    variants: {},
  }
);

/**
 * PostCardコンポーネント
 * REQUIREMENTS.mdの仕様に基づいた投稿カード
 * - 縦長画像（aspect-ratio 2:3）
 * - 画像上にテキストオーバーレイ
 * - フレーバー名の色付きラベル表示
 * - いいねボタン
 * - クリックで投稿詳細ページへ遷移（予定）
 */
export function PostCard({ post, onLike, onClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (post.id) {
      onLike(post.id);
    }
  };

  // フレーバー色のマッピング（Tailwind動的クラス対策）
  const getFlavorColorClass = (color: string | undefined): string => {
    const colorMap: Record<string, string> = {
      "bg-green-500": "bg-green-500",
      "bg-red-500": "bg-red-500",
      "bg-purple-500": "bg-purple-500",
      "bg-yellow-500": "bg-yellow-500",
      "bg-orange-500": "bg-orange-500",
      "bg-indigo-500": "bg-indigo-500",
    };
    return colorMap[color || ""] || "bg-gray-500";
  };

  // 画像URLの構築: 相対パスの場合はBACKEND_URLを結合
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    return `${backendUrl}${url}`;
  };

  return (
    <div className={cardVariants()} onClick={() => onClick(post)}>
      <div className={imageContainerVariants()}>
        <Image
          src={getImageUrl(post.image_url)}
          alt={post.message || "シーシャ投稿"}
          fill
          className={clsx(["object-cover", "transition-transform", "group-hover:scale-105"])}
        />
        <div className={overlayVariants()} />
        <div className={clsx(["absolute", "bottom-0", "left-0", "right-0", "p-4", "text-white"])}>
          <p className={clsx(["text-sm", "font-medium", "mb-2"])}>{post.user?.display_name}</p>
          <p className={clsx(["text-sm", "line-clamp-3"])}>{post.message}</p>
          {post.flavor && (
            <span
              className={clsx([
                "inline-block",
                "mt-2",
                "px-2",
                "py-1",
                "text-xs",
                "rounded-full",
                "text-white",
                getFlavorColorClass(post.flavor.color),
              ])}
            >
              {post.flavor.name}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          className={likeButtonVariants()}
          aria-label="いいね"
        >
          <svg
            className={clsx([
              "w-5",
              "h-5",
              isLiked ? "text-red-500" : "text-white",
              isLiked && "fill-current",
            ])}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
