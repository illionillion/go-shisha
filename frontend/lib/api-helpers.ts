/**
 * レスポンスが成功（2xx）かどうかを判定する型ガード
 * @param response Orval 8.x形式のレスポンス（{ data, status, headers }）
 * @returns 成功時true
 */
import type { ApiError } from "@/lib/api-client";

export function isSuccessResponse<T extends { status: number; data: unknown; headers: Headers }>(
  response: T
): response is Extract<T, { status: 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 }> & {
  headers: Headers;
} {
  return response.status >= 200 && response.status < 300;
}

/**
 * 任意の値がApiErrorかどうかを判定する型ガード
 * @param error 判定対象
 * @returns ApiErrorの場合true
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && "status" in error;
}
