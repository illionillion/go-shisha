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
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      throw new Error(
        "API_URL environment variable is not set. Please set it in your .env file."
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
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  return fetch(url, options);
}
