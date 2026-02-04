import { describe, test, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  test("ISO 8601形式の日付文字列を yyyy/mm/dd hh:mm 形式にフォーマットする", () => {
    expect(formatDate("2024-01-01T12:34:56Z")).toBe("2024/01/01 12:34");
    expect(formatDate("2024-12-31T23:59:00Z")).toBe("2024/12/31 23:59");
    expect(formatDate("2024-06-15T08:05:30Z")).toBe("2024/06/15 08:05");
  });

  test("月・日・時・分が1桁の場合は0埋めする", () => {
    expect(formatDate("2024-01-05T09:03:00Z")).toBe("2024/01/05 09:03");
    expect(formatDate("2024-02-08T00:00:00Z")).toBe("2024/02/08 00:00");
  });

  test("タイムゾーン情報を含む日付文字列を正しく処理する", () => {
    // UTC時刻として処理される
    const result = formatDate("2024-01-01T12:00:00+09:00");
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });

  test("undefined が渡された場合は空文字列を返す", () => {
    expect(formatDate(undefined)).toBe("");
  });

  test("不正な日付文字列が渡された場合は空文字列を返す", () => {
    expect(formatDate("invalid-date")).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("not a date")).toBe("");
  });

  test("日付のみの文字列も正しく処理する", () => {
    const result = formatDate("2024-01-01");
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });
});
