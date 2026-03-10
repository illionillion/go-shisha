import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

/**
 * 指定した画像URLを全てロードしてからフレームを描画する
 * delayRender/continueRender で Remotion のレンダラーに待機を通知する
 */
export function usePreloadImages(srcs: string[]) {
  const [handle] = useState(() => delayRender("Preloading images"));

  useEffect(() => {
    Promise.all(
      srcs.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // エラー時もブロックしない
            img.src = src;
          })
      )
    ).then(() => continueRender(handle));
  }, [handle]);
}
