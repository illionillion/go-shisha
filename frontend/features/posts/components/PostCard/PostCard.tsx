"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar/Avatar";
import { FlavorLabel } from "@/components/FlavorLabel";
import { HeartIcon, NextIcon, PrevIcon } from "@/components/icons";
import { getImageUrl } from "@/lib/getImageUrl";
import type { Post } from "@/types/domain";
import { PostOwnerMenu } from "../PostOwnerMenu";

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onUnlike?: (postId: number) => void;
  /** 自動切り替えのインターバル（ミリ秒）。デフォルト3000ms */
  autoPlayInterval?: number;
  /** 現在ログイン中のユーザーID（自分の投稿かどうかの判定に使用） */
  currentUserId?: number | null;
  /** 投稿削除コールバック（自分の投稿にのみ表示） */
  onDelete?: (postId: number) => void;
  /** 投稿編集コールバック（自分の投稿にのみ表示） */
  onEdit?: (postId: number) => void;
  /** 投稿詳細ページへのリンク */
  href?: string;
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
    // リンクオーバーレイ（z-[1]）より前面に表示
    "z-[2]",
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
 * - 複数画像スライド対応（インスタストーリー風）
 * - 自動切り替え＋手動切り替え対応
 * - 進捗バー表示
 */
export function PostCard({
  post,
  onLike,
  onUnlike,
  autoPlayInterval = 3000,
  currentUserId,
  onDelete,
  onEdit,
  href,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slides = post.slides || [];
  const hasMultipleSlides = slides.length > 1;
  // 自分の投稿かつ onDelete が指定された場合のみメニューを表示
  const isOwner = currentUserId != null && post.user_id === currentUserId && !!onDelete;

  /**
   * 自動再生タイマーをキャンセルして参照をクリアする。
   * 手動スライド切り替え時・プログレスバークリック時・コンポーネントアンマウント時に呼ばれる。
   * 呼び出し後は timerRef.current が null になる。
   */
  const clearAutoPlayTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  /** 自動切り替えタイマー */
  useEffect(() => {
    if (!hasMultipleSlides) return;

    // スライド切り替えタイマー
    timerRef.current = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => {
      clearAutoPlayTimer();
    };
  }, [hasMultipleSlides, slides.length, autoPlayInterval, currentSlideIndex]);

  useEffect(() => {
    setIsLiked(post.is_liked || false);
  }, [post.is_liked]);

  /** 前のスライドへ */
  const handlePrevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearAutoPlayTimer();
    if (slides.length > 0) {
      setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  /** 次のスライドへ */
  const handleNextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearAutoPlayTimer();
    if (slides.length > 0) {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }
  };

  /** 指定インデックスのスライドへジャンプし、既存の自動再生タイマーをキャンセルする */
  const handleGoToSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    clearAutoPlayTimer();
    setCurrentSlideIndex(index);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  const displayText = currentSlide?.text || "";
  const displayFlavor = currentSlide?.flavor;

  return (
    <div className={cardVariants()}>
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
              <button
                type="button"
                key={index}
                className={clsx([
                  "h-1",
                  "flex-1",
                  "rounded-full",
                  "bg-white/30",
                  "overflow-hidden",
                  "cursor-pointer",
                  "border-0",
                  "p-0",
                ])}
                onClick={(e) => handleGoToSlide(e, index)}
                aria-label={`スライド ${index + 1} へ移動`}
              >
                <div
                  key={index === currentSlideIndex ? `bar-${currentSlideIndex}` : `${index}`}
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
              </button>
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
              <PrevIcon className="text-white" />
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
              <NextIcon className="text-white" />
            </button>
          </>
        )}

        {/* 下部テキストオーバーレイ - z-[2]でリンクオーバーレイ（z-[1]）より前面に表示 */}
        <div
          className={clsx([
            "absolute",
            "bottom-0",
            "left-0",
            "right-0",
            "p-4",
            "text-white",
            "z-[2]",
          ])}
        >
          <div className={clsx(["flex", "items-center", "gap-3", "mb-2"])}>
            <Avatar
              src={post.user?.icon_url ?? null}
              alt={post.user?.display_name ?? "ユーザー"}
              size={32}
              userId={post.user?.id}
              linkMode="router"
            />
            <div className={clsx(["text-sm", "font-medium"])}>
              {post.user?.display_name ?? "匿名"}
            </div>

            {/* 3点リーダーメニュー（自分の投稿かつ onDelete が指定された場合のみ表示） */}
            {isOwner && (
              <PostOwnerMenu
                onDelete={() => {
                  if (post.id) onDelete?.(post.id);
                }}
                onEdit={
                  onEdit
                    ? () => {
                        if (post.id) onEdit(post.id);
                      }
                    : undefined
                }
                variant="card"
                menuPosition="top"
                stopPropagation
                className="ml-auto"
              />
            )}
          </div>

          <p className={clsx(["text-sm", "line-clamp-3"])}>{displayText}</p>
          {displayFlavor && <FlavorLabel flavor={displayFlavor} />}
        </div>
      </div>

      {/* ナビゲーション用透明オーバーレイ（z-[1]）- 下部オーバーレイ（z-[2]）より背面 */}
      {href && (
        <Link href={href} className={clsx(["absolute", "inset-0", "z-[1]"])}>
          <span className="sr-only">{`投稿の詳細を見る: ${displayText}`}</span>
        </Link>
      )}

      {/* いいねボタン（z-[2]でリンクオーバーレイより前面に表示） */}
      <button
        type="button"
        onClick={handleLike}
        className={likeButtonVariants()}
        aria-label="いいね"
      >
        <HeartIcon
          className={isLiked ? "text-red-500" : "text-white"}
          size="w-5 h-5"
          isFilled={isLiked}
          showStrokeWhenFilled
        />
      </button>
    </div>
  );
}
