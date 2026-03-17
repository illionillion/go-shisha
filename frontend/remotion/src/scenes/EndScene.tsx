import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

/**
 * [10-12秒] アプリ名＋キャッチコピーでフェードアウト
 */
export function EndScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = 2 * fps; // 2秒

  // フェードイン
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // フェードアウト
  const fadeOut = interpolate(frame, [durationFrames - fps * 0.8, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = Math.min(fadeIn, fadeOut);

  // スケールアニメーション
  const scale = interpolate(frame, [0, fps * 0.5], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.1)),
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* 背景グラデーション */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
          opacity,
        }}
      />

      <div
        style={{
          position: "relative",
          textAlign: "center",
          opacity,
          transform: `scale(${scale})`,
          padding: "0 60px",
        }}
      >
        {/* アプリ名 */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: "#171717",
            margin: 0,
            letterSpacing: "-1px",
            fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
          }}
        >
          シーシャ行こう
        </h1>

        {/* キャッチコピー */}
        <p
          style={{
            fontSize: 36,
            color: "rgba(0,0,0,0.5)",
            margin: "24px 0 0",
            letterSpacing: "2px",
            fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
          }}
        >
          あなたのシーシャをシェアしよう。
        </p>

        {/* 区切り線 */}
        <div
          style={{
            width: 80,
            height: 3,
            backgroundColor: "#6366f1",
            borderRadius: 2,
            margin: "32px auto 0",
          }}
        />
      </div>
    </div>
  );
}
