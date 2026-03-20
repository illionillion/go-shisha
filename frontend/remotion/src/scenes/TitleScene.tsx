import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { FONT_FAMILY } from "../constants/fonts";

/**
 * [0-2秒] タイトル画面
 * 黒背景に「シーシャ行こう」「あなたのシーシャをシェアしよう。」
 */
export function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = 2 * fps; // 2秒

  // タイトルフェードイン
  const titleOpacity = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const titleY = interpolate(frame, [0, fps * 0.6], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // サブタイトルフェードイン（少し遅れて）
  const subtitleOpacity = interpolate(frame, [fps * 0.4, fps * 1.0], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const subtitleY = interpolate(frame, [fps * 0.4, fps * 1.0], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // シーン終了時のフェードアウト
  const sceneOpacity = interpolate(frame, [durationFrames - fps * 0.3, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
        opacity: sceneOpacity,
        overflow: "hidden",
      }}
    >
      {/* 背景のグラデーション装飾 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "relative",
          textAlign: "center",
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
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: FONT_FAMILY,
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
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontFamily: FONT_FAMILY,
          }}
        >
          あなたのシーシャをシェアしよう。
        </p>
      </div>
    </div>
  );
}
