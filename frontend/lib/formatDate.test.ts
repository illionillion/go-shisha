import { describe, it, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("ISO 8601形式の日付文字列を yyyy/mm/dd hh:mm 形式にフォーマットする", () => {
    expect(formatDate("2024-01-01T12:34:56Z")).toBe("2024/01/01 12:34");
    expect(formatDate("2024-12-31T23:59:00Z")).toBe("2024/12/31 23:59");
    expect(formatDate("2024-06-15T08:05:30Z")).toBe("2024/06/15 08:05");
  });

  it("月・日・時・分が1桁の場合は0埋めする", () => {
    expect(formatDate("2024-01-05T09:03:00Z")).toBe("2024/01/05 09:03");
    expect(formatDate("2024-02-08T00:00:00Z")).toBe("2024/02/08 00:00");
  });

  it("タイムゾーン情報を含む日付文字列を正しく処理する", () => {
    // ローカルタイムゾーンで解釈されるため、UTC時刻として検証
    expect(formatDate("2024-01-01T03:00:00Z")).toBe("2024/01/01 03:00");
  });

  it("undefined が渡された場合は空文字列を返す", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("不正な日付文字列が渡された場合は空文字列を返す", () => {
    expect(formatDate("invalid-date")).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("not a date")).toBe("");
  });

  it("日付のみの文字列も正しく処理する", () => {
    // 日付のみの場合は00:00となる
    expect(formatDate("2024-01-01")).toBe("2024/01/01 00:00");
  });
});
