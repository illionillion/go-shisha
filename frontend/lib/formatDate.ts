/**
 * 日付文字列をUTC時刻で`yyyy/mm/dd hh:mm`形式にフォーマットする
 *
 * @param dateString - ISO 8601形式の日付文字列 (例: "2024-01-01T12:34:56Z")
 * @returns UTC時刻を基準にしたフォーマット済みの日付文字列 (例: "2024/01/01 12:34")
 *          不正な入力の場合は空文字列を返す
 *
 * @example
 * ```ts
 * formatDate("2024-01-01T12:34:56Z") // => "2024/01/01 12:34"
 * formatDate("invalid") // => ""
 * formatDate(undefined) // => ""
 * ```
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  // Invalid Date のチェック
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}
