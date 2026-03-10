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
      srcs.map((src) => {
        const img = new Image();
        img.src = src;
        // decode() はロード＋デコード完了まで待つ。onload だとデコード前に解決する場合がある
        return img.decode().catch(() => {
          // decode 非対応ブラウザや失敗時はブロックしない
        });
      })
    ).then(() => continueRender(handle));
  }, [handle]);
}
