import { useEffect, useRef, useState } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FlavorLabel } from "../../../components/FlavorLabel/FlavorLabel";
import type { Post } from "../../../types/domain";
import { FONT_FAMILY } from "../constants/fonts";
import { Avatar } from "./Avatar";

interface PostCardProps {
  post: Post;
  /** スライド1枚あたりのフレーム数。デフォルト90（30fps×3秒） */
  slideFrames?: number;
  /** いいね済み状態を外部から制御 */
  liked?: boolean;
}

export function PostCard({ post, slideFrames = 90, liked = false }: PostCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slides = post.slides || [];
  const hasMultipleSlides = slides.length > 1;

  // フレームからスライドインデックスと進捗を計算
  const currentSlideIndex = hasMultipleSlides ? Math.floor(frame / slideFrames) % slides.length : 0;
  const frameInSlide = frame % slideFrames;
  const slideProgress = frameInSlide / slideFrames;

  const currentSlide = slides.length > 0 ? slides[currentSlideIndex] : undefined;
  const displayImageUrl = currentSlide?.image_url || "";
  const displayText = currentSlide?.text || "";
  const displayFlavor = currentSlide?.flavor;

  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // スライド切り替え時にloaded状態をリセットしてスケルトンを再表示する
  // キャッシュ済み画像はonLoadが再発火しないため、complete確認で即時解除する
  useEffect(() => {
    setLoaded(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [displayImageUrl]);

  // カード出現フェードイン（最初の0.3秒）
  const fadeIn = Math.min(1, frame / (fps * 0.3));

  return (
    <div style={{ position: "relative", cursor: "pointer", opacity: fadeIn }}>
      {/* aspect-ratio 2:3 */}
      <div
        style={{
          aspectRatio: "2/3",
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
          backgroundColor: "#f3f4f6",
        }}
      >
        {/* スケルトン: 画像ロード前に表示 */}
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              backgroundColor: "#e5e7eb",
            }}
          />
        )}

        <img
          ref={imgRef}
          src={displayImageUrl}
          alt={displayText || "シーシャ投稿"}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: loaded ? 1 : 0,
          }}
        />

        {/* グラデーションオーバーレイ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        {/* プログレスバー（フレームベースで幅を計算） */}
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
                  height: 4,
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
                    width:
                      index < currentSlideIndex
                        ? "100%"
                        : index === currentSlideIndex
                          ? `${slideProgress * 100}%`
                          : "0%",
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
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
          {/* アバター + ユーザー名 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Avatar
              src={post.user?.icon_url}
              alt={post.user?.display_name ?? "ユーザー"}
              size={28}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "white",
                fontFamily: FONT_FAMILY,
              }}
            >
              {post.user?.display_name ?? "匿名"}
            </span>
          </div>

          <p
            style={{
              fontSize: 12,
              lineHeight: 1.4,
              margin: "0 0 6px",
              color: "white",
              fontFamily: FONT_FAMILY,
              display: "-webkit-box",
              WebkitLineClamp: 2,
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
