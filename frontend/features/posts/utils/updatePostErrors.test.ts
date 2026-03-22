import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getUpdatePostErrorMessage } from "./updatePostErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getUpdatePostErrorMessage", () => {
  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getUpdatePostErrorMessage(error)).toBe("無効なリクエストです");
  });

  it("unauthorized → 日本語メッセージを返す", () => {
    const error = makeApiError(401, { error: "unauthorized" });
    expect(getUpdatePostErrorMessage(error)).toBe("ログインが必要です");
  });

  it("forbidden → 日本語メッセージを返す", () => {
    const error = makeApiError(403, { error: "forbidden" });
    expect(getUpdatePostErrorMessage(error)).toBe("この投稿を編集する権限がありません");
  });

  it("not_found → 日本語メッセージを返す", () => {
    const error = makeApiError(404, { error: "not_found" });
    expect(getUpdatePostErrorMessage(error)).toBe("投稿が見つかりません");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getUpdatePostErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, { error: "unknown_code" });
    expect(getUpdatePostErrorMessage(error)).toBe("投稿の編集に失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getUpdatePostErrorMessage(error)).toBe("投稿の編集に失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getUpdatePostErrorMessage(new Error("network error"))).toBe("投稿の編集に失敗しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getUpdatePostErrorMessage(undefined)).toBe("投稿の編集に失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(500, { error: "toString" });
    expect(getUpdatePostErrorMessage(error)).toBe("投稿の編集に失敗しました");
  });
});
