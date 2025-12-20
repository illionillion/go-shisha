"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { GoShishaBackendInternalModelsPost } from "@/api/model";
import { FlavorLabel } from "@/components/FlavorLabel";
import { NextIcon, PrevIcon } from "@/components/icons";
import { getImageUrl } from "@/lib/getImageUrl";

interface PostCardProps {
  post: GoShishaBackendInternalModelsPost;
  onLike: (postId: number) => void;
  onUnlike?: (postId: number) => void;
  onClick: (post: GoShishaBackendInternalModelsPost) => void;
  /** 自動切り替えのインターバル（ミリ秒）。デフォルト3000ms */
  autoPlayInterval?: number;
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
export function PostCard({
  post,
  onLike,
  onUnlike,
  onClick,
  autoPlayInterval = 3000,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = post.slides || [];
  const hasMultipleSlides = slides.length > 1;

  /** 自動切り替えタイマー */
  useEffect(() => {
    if (!hasMultipleSlides) return;

    // スライド切り替えタイマー
    const slideTimer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => {
      clearTimeout(slideTimer);
    };
  }, [hasMultipleSlides, slides.length, autoPlayInterval, currentSlideIndex]);

  /** 前のスライドへ */
  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length > 0) {
      setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  /** 次のスライドへ */
  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length > 0) {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }
  };

  const handleLike = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    if (post.id) {
      if (nextLiked) {
        onLike(post.id);
      } else {
        if (onUnlike) onUnlike(post.id);
        else onLike(post.id);
      }
    }
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
                    // Tailwind configでanimate-[progress-bar_linear_forwards]を拡張している前提
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
              <PrevIcon />
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
              <NextIcon />
            </button>
          </>
        )}

        <div className={clsx(["absolute", "bottom-0", "left-0", "right-0", "p-4", "text-white"])}>
          <p className={clsx(["text-sm", "font-medium", "mb-2"])}>{post.user?.display_name}</p>
          <p className={clsx(["text-sm", "line-clamp-3"])}>{displayText}</p>
          {displayFlavor && <FlavorLabel flavor={displayFlavor} />}
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
