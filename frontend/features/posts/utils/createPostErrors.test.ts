import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getCreatePostErrorMessage } from "./createPostErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getCreatePostErrorMessage", () => {
  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getCreatePostErrorMessage(error)).toBe("入力内容を確認してください");
  });

  it("unauthorized → 日本語メッセージを返す", () => {
    const error = makeApiError(401, { error: "unauthorized" });
    expect(getCreatePostErrorMessage(error)).toBe("ログインが必要です");
  });

  it("forbidden → 日本語メッセージを返す", () => {
    const error = makeApiError(403, { error: "forbidden" });
    expect(getCreatePostErrorMessage(error)).toBe("この画像を使用する権限がありません");
  });

  it("not_found → 日本語メッセージを返す", () => {
    const error = makeApiError(404, { error: "not_found" });
    expect(getCreatePostErrorMessage(error)).toBe("指定されたリソースが見つかりません");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getCreatePostErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(400, { error: "unknown_code" });
    expect(getCreatePostErrorMessage(error)).toBe("投稿の作成に失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getCreatePostErrorMessage(error)).toBe("投稿の作成に失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getCreatePostErrorMessage(new Error("network error"))).toBe("投稿の作成に失敗しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getCreatePostErrorMessage(undefined)).toBe("投稿の作成に失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(400, { error: "toString" });
    expect(getCreatePostErrorMessage(error)).toBe("投稿の作成に失敗しました");
  });
});
