import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getLikeErrorMessage, getUnlikeErrorMessage } from "./likeErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getLikeErrorMessage", () => {
  it("already_liked → 日本語メッセージを返す", () => {
    const error = makeApiError(409, { error: "already_liked" });
    expect(getLikeErrorMessage(error)).toBe("この投稿にはすでにいいねしています");
  });

  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getLikeErrorMessage(error)).toBe("無効なリクエストです");
  });

  it("unauthorized → 日本語メッセージを返す", () => {
    const error = makeApiError(401, { error: "unauthorized" });
    expect(getLikeErrorMessage(error)).toBe("ログインが必要です");
  });

  it("not_found → 日本語メッセージを返す", () => {
    const error = makeApiError(404, { error: "not_found" });
    expect(getLikeErrorMessage(error)).toBe("投稿が見つかりません");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getLikeErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(409, { error: "unknown_code" });
    expect(getLikeErrorMessage(error)).toBe("いいねに失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getLikeErrorMessage(error)).toBe("いいねに失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getLikeErrorMessage(new Error("network error"))).toBe("いいねに失敗しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getLikeErrorMessage(undefined)).toBe("いいねに失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(409, { error: "toString" });
    expect(getLikeErrorMessage(error)).toBe("いいねに失敗しました");
  });
});

describe("getUnlikeErrorMessage", () => {
  it("not_liked → 日本語メッセージを返す", () => {
    const error = makeApiError(409, { error: "not_liked" });
    expect(getUnlikeErrorMessage(error)).toBe("この投稿にはいいねしていません");
  });

  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getUnlikeErrorMessage(error)).toBe("無効なリクエストです");
  });

  it("unauthorized → 日本語メッセージを返す", () => {
    const error = makeApiError(401, { error: "unauthorized" });
    expect(getUnlikeErrorMessage(error)).toBe("ログインが必要です");
  });

  it("not_found → 日本語メッセージを返す", () => {
    const error = makeApiError(404, { error: "not_found" });
    expect(getUnlikeErrorMessage(error)).toBe("投稿が見つかりません");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getUnlikeErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(409, { error: "unknown_code" });
    expect(getUnlikeErrorMessage(error)).toBe("いいね解除に失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getUnlikeErrorMessage(error)).toBe("いいね解除に失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getUnlikeErrorMessage(new Error("network error"))).toBe("いいね解除に失敗しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getUnlikeErrorMessage(undefined)).toBe("いいね解除に失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(409, { error: "toString" });
    expect(getUnlikeErrorMessage(error)).toBe("いいね解除に失敗しました");
  });
});
