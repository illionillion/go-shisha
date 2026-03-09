import { useState, useEffect } from "react";
import type { Post } from "../types";
import { Avatar } from "./Avatar";
import { FlavorLabel } from "./FlavorLabel";

interface PostCardProps {
  post: Post;
  /** 自動切り替えのインターバル（ミリ秒）。デフォルト3000ms */
  autoPlayInterval?: number;
  /** いいね済み状態を外部から制御 */
  liked?: boolean;
  /** ズーム倍率 */
  scale?: number;
}

/**
 * Remotion 用 PostCard（next/imageを使わない版）
 */
export function PostCard({ post, autoPlayInterval = 3000, liked = false, scale = 1 }: PostCardProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = post.slides || [];
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides) return;
    const slideTimer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearTimeout(slideTimer);
  }, [hasMultipleSlides, slides.length, autoPlayInterval, currentSlideIndex]);

  const currentSlide = slides.length > 0 ? slides[currentSlideIndex] : undefined;
  const displayImageUrl = currentSlide?.image_url || "";
  const displayText = currentSlide?.text || "";
  const displayFlavor = currentSlide?.flavor;

  return (
    <div
      style={{
        position: "relative",
        cursor: "pointer",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        transition: "transform 0.3s ease",
      }}
    >
      <div
        style={{
          aspectRatio: "2/3",
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        <img
          src={displayImageUrl}
          alt={displayText || "シーシャ投稿"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* グラデーションオーバーレイ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%, transparent 100%)",
          }}
        />

        {/* プログレスバー */}
        {hasMultipleSlides && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              right: 8,
              display: "flex",
              gap: 4,
              zIndex: 10,
            }}
          >
            {slides.map((_, index) => (
              <div
                key={index}
                style={{
                  height: 3,
                  flex: 1,
                  borderRadius: 9999,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 9999,
                    backgroundColor: "white",
                    width: index < currentSlideIndex ? "100%" : "0%",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* いいねボタン */}
        <button
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            padding: 8,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            border: "none",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            zIndex: 10,
          }}
          aria-label="いいね"
        >
          <svg
            style={{
              width: 20,
              height: 20,
              fill: liked ? "#ef4444" : "none",
              stroke: liked ? "#ef4444" : "white",
              strokeWidth: 2,
            }}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* 下部テキスト */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Avatar
              src={post.user?.icon_url}
              alt={post.user?.display_name ?? "ユーザー"}
              size={32}
            />
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {post.user?.display_name ?? "匿名"}
            </div>
          </div>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.4,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {displayText}
          </p>
          {displayFlavor && <FlavorLabel flavor={displayFlavor} />}
        </div>
      </div>
    </div>
  );
}
