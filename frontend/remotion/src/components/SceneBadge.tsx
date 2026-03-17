import { Easing, interpolate } from "remotion";

interface SceneBadgeProps {
  label: string;
  frame: number;
  fps: number;
}

/**
 * シーンラベル（右上テキスト、ニュース字幕風スライドイン）
 * 全シーン共通で使用。position:absolute で右上に固定表示。
 */
export function SceneBadge({ label, frame, fps }: SceneBadgeProps) {
  const slideX = interpolate(frame, [0, fps * 0.4], [60, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const badgeOpacity = interpolate(frame, [0, fps * 0.35], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        right: 44,
        display: "flex",
        alignItems: "center",
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: "8px 16px 8px 10px",
        borderRadius: 6,
        boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
        transform: `translateX(${slideX}px)`,
        opacity: badgeOpacity,
        zIndex: 10,
      }}
    >
      {/* アクセントバー */}
      <div
        style={{
          width: 5,
          height: 36,
          backgroundColor: "#6366f1",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: "#171717",
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "2px",
          fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}
