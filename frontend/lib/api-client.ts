/**
 * APIクライアントのベースURL設定
 * クライアント側とサーバー側で自動的に適切なURLを使用する
 */

/**
 * 実行環境に応じた適切なAPIベースURLを返す
 * @returns APIのベースURL
 * @throws {Error} 必要な環境変数が設定されていない場合
 */
export function getApiBaseUrl(): string {
  // サーバーサイド（RSC、Server Actions等）
  if (typeof window === "undefined") {
    // Docker環境: 内部通信用のAPI_URLを優先
    // 本番環境: NEXT_PUBLIC_API_URLと同じ外部URLを使用
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error(
        "API_URL or NEXT_PUBLIC_API_URL environment variable is not set. Please set it in your .env file."
      );
    }
    return apiUrl;
  }

  // クライアントサイド（ブラウザ）
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!publicApiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL environment variable is not set. Please set it in your .env file."
    );
  }
  return publicApiUrl;
}

/**
 * orvalで生成されたAPI関数をラップし、適切なベースURLでfetchを実行する
 * react-queryモード対応: 第1引数にリクエスト設定オブジェクトを受け取る
 * @param config リクエスト設定（url, method, data, headers等）
 * @param options 追加のfetchオプション
 * @returns fetch Promise
 * @throws {Error} HTTPエラー（4xx, 5xx）が発生した場合
 */
export async function apiFetch<T>(
  config: {
    url: string;
    method: string;
    headers?: HeadersInit;
    data?: unknown;
    signal?: AbortSignal;
  },
  options?: RequestInit
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${config.url}`;

  const res = await fetch(url, {
    ...options,
    method: config.method,
    headers: {
      ...config.headers,
      ...options?.headers,
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
    signal: config.signal,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};

  return { data, status: res.status, headers: res.headers } as T;
}
