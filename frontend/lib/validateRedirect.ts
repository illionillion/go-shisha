/**
 * リダイレクト先パスの安全性検証ヘルパー
 */

/**
 * リダイレクト先が安全かどうかを判定
 * - 相対パスのみ許可
 * - 内部パス（_next、api）は除外
 * - デフォルト遷移先（/、/login、/register）は除外
 * - 長さ制限で悪用を防止
 */
export function isSafeRedirectPath(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  // オープンリダイレクト対策：プロトコル相対URLを拒否
  if (path.startsWith("//")) return false;
  // バックスラッシュを拒否（一部ブラウザで/として解釈される）
  if (path.includes("\\")) return false;
  if (path.startsWith("/_next")) return false;
  if (path.startsWith("/api")) return false;
  if (path === "/" || path === "/login" || path === "/register") return false;
  // limit length to avoid abuse
  if (path.length > 2048) return false;
  return true;
}
