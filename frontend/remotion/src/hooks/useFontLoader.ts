import { loadFont } from "@remotion/google-fonts/NotoSansJP";
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

/**
 * Noto Sans JP を Google Fonts から読み込み、フォント取得完了までレンダーを遅延させる
 * delayRender/continueRender で Remotion のレンダラーに待機を通知する
 */
export function useFontLoader() {
  const [handle] = useState(() => delayRender("Loading Noto Sans JP font"));

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    const { waitUntilDone } = loadFont();

    waitUntilDone()
      .catch((e) => {
        console.warn("[useFontLoader] Noto Sans JP の読み込みに失敗しました:", e);
      })
      .then(() => {
        resolved = true;
        if (!cancelled) continueRender(handle);
      });

    return () => {
      cancelled = true;
      // フォント読み込み完了前にアンマウントされた場合のみhandleを解放する
      if (!resolved) continueRender(handle);
    };
  }, [handle]);
}
