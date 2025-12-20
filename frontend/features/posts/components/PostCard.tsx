"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";

interface PostCardProps {
  post: GoShishaBackendInternalModelsPost;
  onLike: (postId: number) => void;
  onClick: (post: GoShishaBackendInternalModelsPost) => void;
  /** 自動切り替えのインターバル（ミリ秒）。デフォルト3000ms */
  autoPlayInterval?: number;
  /** グローバルtick */
  tick: number;
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
 * - 複数画像スライド対応（インスタストーリー風）
 * - 自動切り替え＋手動切り替え対応
 * - 進捗バー表示
 */
export function PostCard({ post, onLike, onClick, autoPlayInterval = 3000, tick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = post.slides || [];
  const hasMultipleSlides = slides.length > 1;
  const [localTick, setLocalTick] = useState(0);
  const [isManualSlideChange, setIsManualSlideChange] = useState(false);

  /** 自動切り替えタイマー */
  useEffect(() => {
    if (!hasMultipleSlides || isManualSlideChange) return;

    // tickを利用してスライドを同期
    setCurrentSlideIndex(tick % slides.length);
  }, [tick, hasMultipleSlides, slides.length]);

  /** 手動切り替え */
  useEffect(() => {
    if (!hasMultipleSlides || !isManualSlideChange) return;

    // tickを利用してスライドを同期
    setCurrentSlideIndex(localTick % slides.length);
  }, [localTick, hasMultipleSlides, slides.length]);

  // 手動時タイマー
  useEffect(() => {
    if (!isManualSlideChange) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      if (elapsed >= autoPlayInterval) {
        setLocalTick((prev) => prev + 1);
        start = timestamp; // タイマーをリセット
      }

      requestAnimationFrame(step);
    };

    const animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isManualSlideChange, autoPlayInterval]);

  /** 前のスライドへ */
  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsManualSlideChange(true);
  };

  /** 次のスライドへ */
  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    setIsManualSlideChange(true);
  };

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
    if (!url) return "https://placehold.co/400x600/CCCCCC/666666?text=No+Image";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return "https://placehold.co/400x600/CCCCCC/666666?text=No+Image"; // 環境変数が未設定の場合はフォールバック画像を使用
    }
    return `${backendUrl}${url}`;
  };

  // 現在のスライドデータ
  const currentSlide = slides.length > 0 ? slides[currentSlideIndex] : undefined;
  const displayImageUrl = getImageUrl(currentSlide?.image_url);
  const displayText = currentSlide?.text || post.message || "";
  const displayFlavor = currentSlide?.flavor;

  return (
    <div className={cardVariants()} onClick={() => onClick(post)} role="button" tabIndex={0}>
      <div className={imageContainerVariants()}>
        <Image
          src={displayImageUrl}
          alt={displayText || "シーシャ投稿"}
          fill
          className={clsx([
            "object-cover",
            "transition-transform",
            "group-hover:scale-105",
            "group-active:scale-105",
            "select-none",
            "pointer-events-none",
          ])}
        />
        <div className={overlayVariants()} />

        {/* プログレスバー（Instagram Stories風） */}
        {hasMultipleSlides && (
          <div
            className={clsx(["absolute", "top-2", "left-2", "right-2", "flex", "gap-1", "z-10"])}
          >
            {slides.map((_, index) => (
              <div
                key={index}
                className={clsx([
                  "h-1",
                  "flex-1",
                  "rounded-full",
                  "bg-white/30",
                  "overflow-hidden",
                ])}
              >
                <div
                  className={clsx([
                    "h-full",
                    "bg-white",
                    "rounded-full",
                    index < currentSlideIndex && "w-full",
                    index === currentSlideIndex && "w-0 animate-[progress-bar_linear_forwards]",
                    index > currentSlideIndex && "w-0",
                  ])}
                  style={
                    index === currentSlideIndex
                      ? { animationDuration: `${autoPlayInterval}ms` }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* 左右切り替えボタン（複数スライド時のみ表示） */}
        {hasMultipleSlides && (
          <>
            <button
              type="button"
              onClick={handlePrevSlide}
              className={clsx([
                "absolute",
                "left-2",
                "top-1/2",
                "-translate-y-1/2",
                "p-2",
                "rounded-full",
                "bg-white/20",
                "backdrop-blur-sm",
                "hover:bg-white/30",
                "transition-colors",
                "z-10",
              ])}
              aria-label="前のスライド"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              className={clsx([
                "absolute",
                "right-2",
                "top-1/2",
                "-translate-y-1/2",
                "p-2",
                "rounded-full",
                "bg-white/20",
                "backdrop-blur-sm",
                "hover:bg-white/30",
                "transition-colors",
                "z-10",
              ])}
              aria-label="次のスライド"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        <div className={clsx(["absolute", "bottom-0", "left-0", "right-0", "p-4", "text-white"])}>
          <p className={clsx(["text-sm", "font-medium", "mb-2"])}>{post.user?.display_name}</p>
          <p className={clsx(["text-sm", "line-clamp-3"])}>{displayText}</p>
          {displayFlavor && (
            <span
              className={clsx([
                "inline-block",
                "mt-2",
                "px-2",
                "py-1",
                "text-xs",
                "rounded-full",
                "text-white",
                "select-none",
                getFlavorColorClass(displayFlavor.color),
              ])}
            >
              {displayFlavor.name}
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
