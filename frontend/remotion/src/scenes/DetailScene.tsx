import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from "remotion";
import { FlavorLabel } from "../../../components/FlavorLabel/FlavorLabel";
import { Avatar } from "../components/Avatar";
import { PostCard } from "../components/PostCard";
import { FEATURED_POST } from "../mock-data";

/**
 * [7-10秒] 1枚ズームして投稿詳細・いいねアニメーション
 */
export function DetailScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = 3 * fps; // 3秒

  // カードのズームイン
  const cardScale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
      mass: 1,
    },
    from: 0.6,
    to: 1,
  });

  // フェードイン
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // いいねアニメーション（1.5秒当たり）
  const likeFrame = Math.max(0, frame - Math.round(fps * 1.5));
  const likeScale = spring({
    frame: likeFrame,
    fps,
    config: {
      damping: 8,
      stiffness: 200,
      mass: 0.5,
    },
    from: 1,
    to: likeFrame > 0 ? 1.5 : 1,
  });

  const isLiked = frame >= Math.round(fps * 1.5);
  const likeCount = isLiked ? (FEATURED_POST.likes ?? 0) + 1 : (FEATURED_POST.likes ?? 0);

  // 詳細パネルのスライドイン
  const panelX = interpolate(frame, [fps * 0.2, fps * 0.6], [80, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const panelOpacity = interpolate(frame, [fps * 0.2, fps * 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // フェードアウト
  const sceneOpacity = interpolate(frame, [durationFrames - fps * 0.3, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slide = FEATURED_POST.slides?.[0];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d0d0d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        padding: 60,
        opacity: sceneOpacity * opacity,
        overflow: "hidden",
      }}
    >
      {/* カード（ズームイン） */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          transform: `scale(${cardScale})`,
        }}
      >
        <PostCard post={FEATURED_POST} liked={isLiked} autoPlayInterval={99999} />
      </div>

      {/* 詳細パネル */}
      <div
        style={{
          flex: 1,
          color: "white",
          opacity: panelOpacity,
          transform: `translateX(${panelX}px)`,
        }}
      >
        {/* ユーザー情報 */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Avatar
            src={FEATURED_POST.user?.icon_url}
            alt={FEATURED_POST.user?.display_name ?? "ユーザー"}
            size={56}
          />
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
              }}
            >
              {FEATURED_POST.user?.display_name}
            </div>
          </div>
        </div>

        {/* テキスト */}
        <p
          style={{
            fontSize: 32,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 24px",
            fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
          }}
        >
          {slide?.text}
        </p>

        {/* フレーバー */}
        {slide?.flavor && (
          <div style={{ marginBottom: 32 }}>
            <FlavorLabel flavor={slide.flavor} />
          </div>
        )}

        {/* いいねボタン */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              transform: `scale(${likeScale})`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              style={{
                width: 48,
                height: 48,
                fill: isLiked ? "#ef4444" : "none",
                stroke: isLiked ? "#ef4444" : "rgba(255,255,255,0.7)",
                strokeWidth: 2,
                transition: "all 0.2s",
              }}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: isLiked ? "#ef4444" : "rgba(255,255,255,0.7)",
                fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
              }}
            >
              {likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
