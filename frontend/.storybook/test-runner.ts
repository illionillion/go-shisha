// Storybook Test Runner 設定
import type { TestRunnerConfig } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";

// デバイスごとの設定を環境変数 `VRT_DEVICE` で切り替えられるようにする
// 例: `VRT_DEVICE=pc pnpm test:vrt` / `VRT_DEVICE=sp pnpm test:vrt`
const DEVICE = (process.env.VRT_DEVICE || "pc").toLowerCase();
let VIEWPORT = { width: 1280, height: 800 };
let SNAPSHOTS_DIR = "__image_snapshots__/pc";
let SNAPSHOTS_DIFF_DIR = "__image_snapshots__/__diff_output__/pc";
if (DEVICE === "sp" || DEVICE === "mobile") {
  // iPhone-ish viewport
  VIEWPORT = { width: 480, height: 844 };
  SNAPSHOTS_DIR = "__image_snapshots__/sp";
  SNAPSHOTS_DIFF_DIR = "__image_snapshots__/__diff_output__/sp";
}

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  /**
   * VRTタグフィルタリング設定
   * @description
   * デバイスに応じて include するタグを切り替える。
   * - PC（デフォルト）: `tags: ['vrt']` を付けた Story を撮る
   * - SP              : `tags: ['vrt-sp']` を付けた Story のみ撮る
   */
  tags: {
    include: DEVICE === "sp" || DEVICE === "mobile" ? ["vrt-sp"] : ["vrt"],
  },
  async preVisit(page) {
    // 画面幅を明示的に指定
    await page.setViewportSize(VIEWPORT);
    // ライトモードを強制（ダークモードを無効化）
    await page.emulateMedia({ colorScheme: "light" });
  },
  async postVisit(page, context) {
    // CSSとフォントの読み込みを待つ
    await page.waitForLoadState("networkidle");
    // DOMContentLoadedも待機
    await page.waitForLoadState("domcontentloaded");
    // フォント読み込み完了を待機
    await page.evaluate(() => document.fonts.ready);
    // 画像読み込み完了を待機
    await page.evaluate(() => {
      const images = Array.from(document.images);
      return Promise.all(
        images
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              })
          )
      );
    });
    // 追加の待機時間（アニメーションやレンダリング完了のため）
    await page.waitForTimeout(2000);

    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      // Story ID にデバイス識別子を付与して衝突を避ける
      customSnapshotIdentifier: context.id,
      // デバイス別にスナップショット格納先を分ける
      customSnapshotsDir: SNAPSHOTS_DIR,
      customDiffDir: SNAPSHOTS_DIFF_DIR,
      failureThreshold: 0.001, // 0.1%の差分を許容（フォント・アンチエイリアシング差異対応）
      failureThresholdType: "percent",
    });
  },
};

export default config;
