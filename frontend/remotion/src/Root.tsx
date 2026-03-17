import { Composition, AbsoluteFill, Series } from "remotion";
import { usePreloadImages } from "./hooks/usePreloadImages";
import { MOCK_POSTS } from "./mock-data";
import { DetailScene } from "./scenes/DetailScene";
import { EndScene } from "./scenes/EndScene";
import { HomeScene } from "./scenes/HomeScene";
import { ShareScene } from "./scenes/ShareScene";
import { TitleScene } from "./scenes/TitleScene";
import "./styles.css";

// 全シーンで使う画像を事前収集（空文字や未設定は除外）
const ALL_IMAGES = MOCK_POSTS.flatMap((p) => p.slides?.map((s) => s.image_url) ?? []).filter(
  (url): url is string => !!url
);

const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;

// 各シーンのフレーム数
const TITLE_FRAMES = 2 * FPS; // 0-2秒
const HOME_FRAMES = 5 * FPS; // 2-7秒
const DETAIL_FRAMES = 4 * FPS; // 7-11秒
const SHARE_FRAMES = 4 * FPS; // 11-15秒
const END_FRAMES = 2 * FPS; // 15-17秒
const TOTAL_FRAMES = TITLE_FRAMES + HOME_FRAMES + DETAIL_FRAMES + SHARE_FRAMES + END_FRAMES;

function ShishaPromoVideo() {
  // フレーム0より前に全画像のロード+デコードを完了させる
  usePreloadImages(ALL_IMAGES);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f9fafb" }}>
      <Series>
        <Series.Sequence durationInFrames={TITLE_FRAMES}>
          <TitleScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={HOME_FRAMES}>
          <HomeScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DETAIL_FRAMES}>
          <DetailScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHARE_FRAMES}>
          <ShareScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={END_FRAMES}>
          <EndScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
}

export function Root() {
  return (
    <Composition
      id="ShishaPromo"
      component={ShishaPromoVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
}
