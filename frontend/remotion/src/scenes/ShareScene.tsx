import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneBadge } from "../components/SceneBadge";
import { FONT_FAMILY } from "../constants/fonts";
import { MOCK_POSTS } from "../mock-data";

/**
 * 「共有する」シーン
 * 実フォーム（SlideEditForm）の縦積みレイアウトに準拠
 *
 * 実フォームとの対応:
 * - モーダル: sm:max-w-2xl / rounded-xl / flex-col
 * - ヘッダー: "投稿を作成" + × + border-b
 * - 画像: 上部 aspect-square / object-contain / bg-gray-100（縦積み）
 * - スライドヘッダー: "画像 1 / 1" + 前後ボタン
 * - フレーバー: セレクトボックス風ドロップダウン
 * - 説明: textarea 3行 + 文字数カウント
 * - フッター: border-t + "戻る" + "投稿する"(bg-blue-500)
 *
 * キャンバス 1280×720 に収まるよう、
 * モーダル高さを固定しコンテンツを compact に配置。
 */
export function ShareScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = 4 * fps;

  // モーダルのスライドイン (0〜0.4s)
  const formY = interpolate(frame, [0, fps * 0.4], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });
  const formOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // テキストタイピング (0.5s〜2.0s)
  const fullText = "ダブルアップルで！甘さと爽やかさが最高◎";
  const textLength = Math.floor(
    interpolate(frame, [fps * 0.5, fps * 2.0], [0, fullText.length], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    })
  );
  const displayText = fullText.slice(0, textLength);

  // フレーバーセレクト強調 (2.3s〜)
  const flavorSelected = frame >= fps * 2.3;
  const flavorHighlight = spring({
    frame: Math.max(0, frame - fps * 2.3),
    fps,
    config: { damping: 12, stiffness: 250, mass: 0.5 },
    from: 0,
    to: 1,
  });

  // 投稿ボタンのハイライト (3.2s〜)
  const buttonHighlight = frame >= fps * 3.2;
  const buttonScale = spring({
    frame: Math.max(0, frame - fps * 3.2),
    fps,
    config: { damping: 10, stiffness: 300, mass: 0.5 },
    from: 1,
    to: buttonHighlight ? 1.04 : 1,
  });

  // シーン終了フェードアウト
  const sceneOpacity = interpolate(frame, [durationFrames - fps * 0.3, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ダブルアップルのスライド (MOCK_POSTS[0].slides[1])
  const slide = MOCK_POSTS[0]?.slides?.[1];
  const flavor = slide?.flavor;

  // モーダル寸法: 縦積みレイアウト、キャンバス 1280×720 に収める
  const MODAL_WIDTH = 440;
  const MODAL_HEIGHT = 640; // 720 - 上下余白 40px ずつ

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneOpacity,
      }}
    >
      {/* シーンラベル */}
      <SceneBadge label="共有する" frame={frame} fps={fps} />

      {/* モーダルパネル（縦積み / flex-col） */}
      <div
        style={{
          width: MODAL_WIDTH,
          height: MODAL_HEIGHT,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: formOpacity,
          transform: `translateY(${formY}px)`,
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            flexShrink: 0,
            borderBottom: "1px solid #e5e7eb",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#171717",
              fontFamily: FONT_FAMILY,
            }}
          >
            投稿を作成
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#6b7280",
            }}
          >
            ✕
          </div>
        </div>

        {/* コンテンツ（縦積み / overflow hidden） */}
        <div
          style={{
            flex: 1,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "hidden",
          }}
        >
          {/* スライドヘッダー */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#171717",
                fontFamily: FONT_FAMILY,
              }}
            >
              画像 1 / 1
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {["前", "次"].map((label) => (
                <div
                  key={label}
                  style={{
                    padding: "2px 10px",
                    borderRadius: 6,
                    backgroundColor: "#e5e7eb",
                    fontSize: 12,
                    color: "#9ca3af",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* 画像プレビュー（aspect-square / object-contain） */}
          <div
            style={{
              flexShrink: 0,
              width: "100%",
              aspectRatio: "1 / 1",
              // aspect-square だと高さが大きくなりすぎるので最大高さで制限
              maxHeight: 220,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {slide?.image_url && (
              <img
                src={slide.image_url}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                alt="投稿画像"
              />
            )}
          </div>

          {/* ファイル情報 */}
          <div style={{ flexShrink: 0 }}>
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                margin: "1px 0",
                fontFamily: FONT_FAMILY,
              }}
            >
              ファイル名: double_apple.jpg
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                margin: "1px 0",
                fontFamily: FONT_FAMILY,
              }}
            >
              サイズ: 1.24 MB
            </p>
          </div>

          {/* フレーバー選択（セレクトボックス風） */}
          <div style={{ flexShrink: 0 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
                fontFamily: FONT_FAMILY,
              }}
            >
              フレーバー（任意）
            </label>
            <div
              style={{
                border: flavorSelected ? "1.5px solid #3b82f6" : "1px solid #d1d5db",
                borderRadius: 6,
                padding: "7px 12px",
                fontSize: 13,
                color: flavorSelected ? "#171717" : "#9ca3af",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: flavorSelected
                  ? `0 0 0 ${flavorHighlight * 3}px rgba(59,130,246,0.15)`
                  : "none",
                fontFamily: FONT_FAMILY,
              }}
            >
              {flavorSelected && flavor ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      flexShrink: 0,
                    }}
                  />
                  {flavor.name}
                </>
              ) : (
                "フレーバーを選択..."
              )}
              <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 11 }}>▼</span>
            </div>
          </div>

          {/* 説明テキストエリア */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
                fontFamily: FONT_FAMILY,
              }}
            >
              説明（オプション、100文字まで）
            </label>
            <div
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#171717",
                backgroundColor: "#ffffff",
                height: 64,
                lineHeight: 1.6,
                overflow: "hidden",
                fontFamily: FONT_FAMILY,
              }}
            >
              {displayText}
              {textLength < fullText.length && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1em",
                    backgroundColor: "#3b82f6",
                    marginLeft: 2,
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </div>
            <p
              style={{
                textAlign: "right",
                fontSize: 11,
                color: "#6b7280",
                marginTop: 3,
                fontFamily: FONT_FAMILY,
              }}
            >
              {displayText.length} / 100文字
            </p>
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid #e5e7eb",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              padding: "7px 20px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              fontFamily: FONT_FAMILY,
            }}
          >
            戻る
          </div>
          <div
            style={{
              padding: "7px 20px",
              borderRadius: 6,
              backgroundColor: buttonHighlight ? "#2563eb" : "#3b82f6",
              fontSize: 14,
              fontWeight: 500,
              color: "#ffffff",
              transform: `scale(${buttonScale})`,
              fontFamily: FONT_FAMILY,
            }}
          >
            投稿する
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
