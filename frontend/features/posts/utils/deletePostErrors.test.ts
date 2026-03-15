import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getDeletePostErrorMessage } from "./deletePostErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getDeletePostErrorMessage", () => {
  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getDeletePostErrorMessage(error)).toBe("無効なリクエストです");
  });

  it("unauthorized → 日本語メッセージを返す", () => {
    const error = makeApiError(401, { error: "unauthorized" });
    expect(getDeletePostErrorMessage(error)).toBe("ログインが必要です");
  });

  it("forbidden → 日本語メッセージを返す", () => {
    const error = makeApiError(403, { error: "forbidden" });
    expect(getDeletePostErrorMessage(error)).toBe("この投稿を削除する権限がありません");
  });

  it("not_found → 日本語メッセージを返す", () => {
    const error = makeApiError(404, { error: "not_found" });
    expect(getDeletePostErrorMessage(error)).toBe("投稿が見つかりません");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getDeletePostErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, { error: "unknown_code" });
    expect(getDeletePostErrorMessage(error)).toBe("投稿の削除に失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getDeletePostErrorMessage(error)).toBe("投稿の削除に失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getDeletePostErrorMessage(new Error("network error"))).toBe("投稿の削除に失敗しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getDeletePostErrorMessage(undefined)).toBe("投稿の削除に失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(500, { error: "toString" });
    expect(getDeletePostErrorMessage(error)).toBe("投稿の削除に失敗しました");
  });
});
