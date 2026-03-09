import { Composition, AbsoluteFill, Series } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { HomeScene } from "./scenes/HomeScene";
import { DetailScene } from "./scenes/DetailScene";
import { EndScene } from "./scenes/EndScene";
import "./styles.css";

const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;

// 各シーンのフレーム数
const TITLE_FRAMES = 2 * FPS;   // 0-2秒
const HOME_FRAMES = 5 * FPS;    // 2-7秒
const DETAIL_FRAMES = 3 * FPS;  // 7-10秒
const END_FRAMES = 2 * FPS;     // 10-12秒
const TOTAL_FRAMES = TITLE_FRAMES + HOME_FRAMES + DETAIL_FRAMES + END_FRAMES;

function ShishaPromoVideo() {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
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
