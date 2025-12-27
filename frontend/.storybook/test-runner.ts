// Storybook Test Runner 設定
import type { TestRunnerConfig } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";

const VIEWPORT = { width: 1280, height: 800 };

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  /**
   * VRTタグフィルタリング設定
   * @description
   * この設定により、`tags: ['vrt']` が付与されたStoryのみがVRT（Visual Regression Test）のテスト対象となります。
   * タグが付与されていないStoryは全てテスト対象外となるため、VRTテストを追加したい場合はStory側で`tags: ['vrt']`を明示してください。
   * 将来的なStory追加・メンテナンス時はこの仕様に注意してください。
   */
  tags: {
    include: ["vrt"],
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
      customSnapshotIdentifier: context.id,
      // スナップショットをfrontend直下の__image_snapshots__に集約
      customSnapshotsDir: "__image_snapshots__",
      customDiffDir: "__image_snapshots__/__diff_output__",
      failureThreshold: 0.001, // 0.1%の差分を許容（フォント・アンチエイリアシング差異対応）
      failureThresholdType: "percent",
    });
  },
};

export default config;
