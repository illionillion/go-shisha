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
 * @param path APIパス（例: "/posts"）
 * @param options fetch options
 * @returns fetch Promise
 * @throws {Error} HTTPエラー（4xx, 5xx）が発生した場合
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};

  return { data, status: res.status, headers: res.headers } as T;
}
