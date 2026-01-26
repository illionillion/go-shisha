/**
 * レスポンスが成功（2xx）かどうかを判定する型ガード
 * @param response Orval 8.x形式のレスポンス（{ data, status, headers }）
 * @returns 成功時true
 */
export function isSuccessResponse<T extends { status: number; data: unknown; headers: Headers }>(
  response: T
): response is Extract<T, { status: 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 }> & {
  headers: Headers;
} {
  return response.status >= 200 && response.status < 300;
}
