import { describe, it, expect } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { getRegisterErrorMessage } from "./registerErrors";

/** テスト用ApiErrorを生成するヘルパー */
const makeApiError = (status: number, bodyJson: unknown): ApiError =>
  Object.assign(new Error(`API Error: ${status}`), {
    status,
    bodyJson,
  });

describe("getRegisterErrorMessage", () => {
  it("email_already_exists → 日本語メッセージを返す", () => {
    const error = makeApiError(409, { error: "email_already_exists" });
    expect(getRegisterErrorMessage(error)).toBe("このメールアドレスは既に使用されています");
  });

  it("validation_failed → 日本語メッセージを返す", () => {
    const error = makeApiError(400, { error: "validation_failed" });
    expect(getRegisterErrorMessage(error)).toBe("入力値を確認してください");
  });

  it("internal_server_error → 日本語メッセージを返す", () => {
    const error = makeApiError(500, { error: "internal_server_error" });
    expect(getRegisterErrorMessage(error)).toBe("サーバーエラーが発生しました");
  });

  it("未知のエラーコード → フォールバックメッセージを返す", () => {
    const error = makeApiError(409, { error: "unknown_code" });
    expect(getRegisterErrorMessage(error)).toBe("通信エラーが発生しました");
  });

  it("bodyJsonがない場合 → フォールバックメッセージを返す", () => {
    const error = makeApiError(500, undefined);
    expect(getRegisterErrorMessage(error)).toBe("通信エラーが発生しました");
  });

  it("ApiErrorでない場合（ネットワーク断など）→ フォールバックメッセージを返す", () => {
    expect(getRegisterErrorMessage(new Error("network error"))).toBe("通信エラーが発生しました");
  });

  it("undefinedの場合 → フォールバックメッセージを返す", () => {
    expect(getRegisterErrorMessage(undefined)).toBe("通信エラーが発生しました");
  });
});
