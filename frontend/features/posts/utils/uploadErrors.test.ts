import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getUploadImageErrorMessage } from "./uploadErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getUploadImageErrorMessage", () => {
  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getUploadImageErrorMessage(error)).toBe("ファイル形式またはサイズが不正です");
  });

  it("unauthorized → 日本語メッセージを返す", () => {
    const error = makeApiError(401, { error: "unauthorized" });
    expect(getUploadImageErrorMessage(error)).toBe("ログインが必要です");
  });

  it("payload_too_large → 日本語メッセージを返す", () => {
    const error = makeApiError(413, { error: "payload_too_large" });
    expect(getUploadImageErrorMessage(error)).toBe("ファイルサイズが大きすぎます");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getUploadImageErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(400, { error: "unknown_code" });
    expect(getUploadImageErrorMessage(error)).toBe("画像のアップロードに失敗しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getUploadImageErrorMessage(error)).toBe("画像のアップロードに失敗しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getUploadImageErrorMessage(new Error("network error"))).toBe(
      "画像のアップロードに失敗しました"
    );
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getUploadImageErrorMessage(undefined)).toBe("画像のアップロードに失敗しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(400, { error: "toString" });
    expect(getUploadImageErrorMessage(error)).toBe("画像のアップロードに失敗しました");
  });
});
