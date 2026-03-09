import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getLoginErrorMessage } from "./loginErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getLoginErrorMessage", () => {
  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getLoginErrorMessage(error)).toBe("入力値を確認してください");
  });

  it("unauthorized → 日本語メッセージを返す", () => {
    const error = makeApiError(401, { error: "unauthorized" });
    expect(getLoginErrorMessage(error)).toBe("メールアドレスまたはパスワードが正しくありません");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getLoginErrorMessage(error)).toBe("通信エラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(400, { error: "unknown_code" });
    expect(getLoginErrorMessage(error)).toBe("通信エラーが発生しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getLoginErrorMessage(error)).toBe("通信エラーが発生しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getLoginErrorMessage(new Error("network error"))).toBe("通信エラーが発生しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getLoginErrorMessage(undefined)).toBe("通信エラーが発生しました");
  });

  it("Object.prototype由来のキー（toString等）→ フォールバックメッセージを返す", () => {
    const error = makeApiError(401, { error: "toString" });
    expect(getLoginErrorMessage(error)).toBe("通信エラーが発生しました");
  });
});
