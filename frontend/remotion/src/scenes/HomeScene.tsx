import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { PostCard } from "../components/PostCard";
import { SceneBadge } from "../components/SceneBadge";
import { MOCK_POSTS } from "../mock-data";

/**
 * [2-7秒] ホーム画面（3列グリッド）
 * PostCardが並びスライド自動切り替えが映える
 */
// フレーバーフィルタに表示するチップ定義
const FLAVOR_CHIPS = [
  { id: 1, name: "ミント", bg: "#22c55e" },
  { id: 2, name: "アップル", bg: "#ef4444" },
  { id: 3, name: "ベリー", bg: "#a855f7" },
  { id: 5, name: "オレンジ", bg: "#f97316" },
  { id: 6, name: "グレープ", bg: "#6366f1" },
];

export function HomeScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = 5 * fps; // 5秒

  // カード群のフェードイン
  const opacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // カード群がY軸からスライドイン
  const gridY = interpolate(frame, [0, fps * 0.5], [60, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });

  // シーン全体のフェードアウト
  const sceneOpacity = interpolate(frame, [durationFrames - fps * 0.3, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ヘッダーのフェードイン
  const headerOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // フレーバーフィルタチップのフェードイン (1.5s〜2.0s)
  const filterOpacity = interpolate(frame, [fps * 1.5, fps * 2.0], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const filterY = interpolate(frame, [fps * 1.5, fps * 2.0], [16, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // 2.5s で「ミント」チップが選択される
  const mintSelected = frame >= fps * 2.5;
  const mintSelectProgress = interpolate(frame, [fps * 2.5, fps * 2.8], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // フレーバーidが 1 (ミント) のスライドを持つ投稿はそのまま表示、それ以外はフェードアウト
  const filterApplied = frame >= fps * 2.5;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        opacity: sceneOpacity,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: "20px 32px 8px",
          opacity: headerOpacity,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#171717",
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
      </div>

      {/* シーンラベル */}
      <SceneBadge label="見る" frame={frame} fps={fps} />

      {/* フレーバーフィルタチップ */}
      <div
        style={{
          padding: "0 32px 8px",
          display: "flex",
          gap: 8,
          opacity: filterOpacity,
          transform: `translateY(${filterY}px)`,
        }}
      >
        {FLAVOR_CHIPS.map((chip) => {
          const isSelected = chip.id === 1 && mintSelected;
          return (
            <div
              key={chip.id}
              style={{
                padding: "6px 16px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: isSelected ? chip.bg : "#f3f4f6",
                color: isSelected ? "#ffffff" : "#6b7280",
                border: isSelected ? `2px solid ${chip.bg}` : "2px solid #e5e7eb",
                transform: isSelected ? `scale(${1 + mintSelectProgress * 0.06})` : "scale(1)",
                fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
              }}
            >
              {chip.name}
            </div>
          );
        })}
      </div>

      {/* グリッド */}
      <div
        style={{
          flex: 1,
          padding: "0 32px 16px",
          opacity,
          transform: `translateY(${gridY}px) scale(0.95)`,
          transformOrigin: "top center",
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
          {MOCK_POSTS.slice(0, 6).map((post) => {
            const hasMintyFlavor = post.slides?.some((s) => s.flavor?.id === 1) ?? false;
            const cardOpacity = filterApplied
              ? interpolate(frame, [fps * 2.5, fps * 3.0], [1, hasMintyFlavor ? 1 : 0.2], {
                  extrapolateRight: "clamp",
                  extrapolateLeft: "clamp",
                })
              : 1;
            return (
              <div key={post.id} style={{ opacity: cardOpacity }}>
                <PostCard post={post} slideFrames={90} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
