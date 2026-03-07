import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getFlavorErrorMessage } from "./flavorErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getFlavorErrorMessage", () => {
  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getFlavorErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, { error: "unknown_code" });
    expect(getFlavorErrorMessage(error)).toBe("フレーバーの取得に失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getFlavorErrorMessage(error)).toBe("フレーバーの取得に失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getFlavorErrorMessage(new Error("network error"))).toBe(
      "フレーバーの取得に失敗しました"
    );
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getFlavorErrorMessage(undefined)).toBe("フレーバーの取得に失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(500, { error: "toString" });
    expect(getFlavorErrorMessage(error)).toBe("フレーバーの取得に失敗しました");
  });
});
