import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getUserPostsErrorMessage } from "./userPostsErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getUserPostsErrorMessage", () => {
  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getUserPostsErrorMessage(error)).toBe("無効なユーザーIDです");
  });

  it("not_found → 日本語メッセージを返す", () => {
    const error = makeApiError(404, { error: "not_found" });
    expect(getUserPostsErrorMessage(error)).toBe("ユーザーが見つかりません");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getUserPostsErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(400, { error: "unknown_code" });
    expect(getUserPostsErrorMessage(error)).toBe("投稿の取得に失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getUserPostsErrorMessage(error)).toBe("投稿の取得に失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getUserPostsErrorMessage(new Error("network error"))).toBe("投稿の取得に失敗しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getUserPostsErrorMessage(undefined)).toBe("投稿の取得に失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(400, { error: "toString" });
    expect(getUserPostsErrorMessage(error)).toBe("投稿の取得に失敗しました");
  });
});
