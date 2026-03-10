import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { PostCard } from "../components/PostCard";
import { usePreloadImages } from "../hooks/usePreloadImages";
import { MOCK_POSTS } from "../mock-data";

const ALL_IMAGES = MOCK_POSTS.flatMap((p) => p.slides?.map((s) => s.image_url ?? "") ?? []);

/**
 * [2-7秒] ホーム画面（3列グリッド）
 * PostCardが並びスライド自動切り替えが映える
 */
export function HomeScene() {
  usePreloadImages(ALL_IMAGES);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = 5 * fps; // 5秒

  // フェードイン
  const opacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // カード群がY軸からスライドイン
  const gridY = interpolate(frame, [0, fps * 0.5], [60, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });

  // フェードアウト
  const sceneOpacity = interpolate(frame, [durationFrames - fps * 0.3, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ヘッダーのスライドイン
  const headerOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#111111",
        display: "flex",
        flexDirection: "column",
        opacity: sceneOpacity,
        overflow: "hidden",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: "40px 40px 20px",
          opacity: headerOpacity,
        }}
      >
        <h2
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: "#ffffff",
            margin: 0,
            fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
          }}
        >
          シーシャ行こう
        </h2>
        <div
          style={{
            width: 60,
            height: 4,
            backgroundColor: "#6366f1",
            borderRadius: 2,
            marginTop: 8,
          }}
        />
      </div>

      {/* グリッド */}
      <div
        style={{
          flex: 1,
          padding: "0 40px",
          opacity,
          transform: `translateY(${gridY}px)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            height: "100%",
          }}
        >
          {MOCK_POSTS.slice(0, 6).map((post) => (
            <PostCard key={post.id} post={post} autoPlayInterval={3000} />
          ))}
        </div>
      </div>
    </div>
  );
}
