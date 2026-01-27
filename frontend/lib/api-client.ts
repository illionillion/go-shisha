/**
 * APIクライアントのベースURL設定
 * クライアント側とサーバー側で自動的に適切なURLを使用する
 */

import { tryRefreshToken } from "./token-refresh";

/**
 * 実行環境に応じた適切なAPIベースURLを返す
 * - クライアントサイド: /api/v1（Next.jsのrewritesでプロキシ）
 * - サーバーサイド: http://localhost:8080/api/v1（直接バックエンドに接続）
 * @returns APIのベースURL
 */
export function getApiBaseUrl(): string {
  // サーバーサイド（Server Component等）では絶対URLが必要
  if (typeof window === "undefined") {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    return `${backendUrl}/api/v1`;
  }

  // クライアントサイド: Next.jsのrewritesで /api/v1/* → バックエンドにプロキシ
  // Orvalが生成するURLは /auth/login などbasePathを含まないため、ここで /api/v1 を付ける
  return "/api/v1";
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
