/**
 * APIクライアントのベースURL設定
 * クライアント側とサーバー側で自動的に適切なURLを使用する
 */

import { tryRefreshToken } from "./token-refresh";

/**
 * 実行環境に応じた適切なAPIベースURLを返す
 * Next.jsのrewritesで /api/v1 → バックエンドにプロキシするため空文字列を返す
 * これにより同一オリジンとなり、Cookie（SameSite=Lax）が正常に動作する
 * @returns APIのベースURL（空文字列 = 相対パス）
 */
export function getApiBaseUrl(): string {
  // Next.jsのrewritesで /api/v1/* → バックエンドにプロキシ
  return "";
}

/**
 * orvalで生成されたAPI関数をラップし、適切なベースURLでfetchを実行する
 * Orval 8.x対応: 第1引数にURL、第2引数にRequestInitを受け取る
 * レスポンスは { data: T, status: number, headers: Headers } 形式で返す
 * @param url APIエンドポイントのパス
 * @param options fetchオプション（method, headers, body等）
 * @returns fetch Promise（Orval 8.x形式: { data, status, headers }）
 * @throws {Error} HTTPエラー（4xx, 5xx）が発生した場合
 */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    credentials: options?.credentials ?? "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    let parsedBody: unknown;
    try {
      parsedBody = errorText ? JSON.parse(errorText) : undefined;
    } catch {
      parsedBody = undefined;
    }

    // 401エラー時、リフレッシュトークンで自動再試行
    // ただし、リフレッシュAPI自体は再試行しない（無限ループ防止）
    if (res.status === 401 && url !== "/auth/refresh" && typeof window !== "undefined") {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // リフレッシュ成功、元のリクエストをリトライ
        return apiFetch<T>(url, options);
      }
      // リフレッシュ失敗（ログアウト状態）→エラーをそのまま投げる
    }

    const error: ApiError = Object.assign(new Error(`API Error: ${res.status} ${res.statusText}`), {
      status: res.status,
      statusText: res.statusText,
      bodyText: errorText,
      bodyJson: parsedBody,
    });
    throw error;
  }

  // Orval 8.x 形式でレスポンスを返す: { data, status, headers }
  const bodyText = [204, 205, 304].includes(res.status) ? null : await res.text();
  const bodyData = bodyText ? JSON.parse(bodyText) : null;

  const response = {
    data: bodyData,
    status: res.status,
    headers: res.headers,
  };

  return response as T;
}

export type ApiError = Error & {
  status?: number;
  statusText?: string;
  bodyText?: string;
  bodyJson?: unknown;
};
