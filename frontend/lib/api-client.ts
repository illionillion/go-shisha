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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL environment variable is not set. Please set it in your .env file."
    );
  }
  return apiUrl;
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

  // ヘッダーマージ: 明示的指定を優先（config.headers > 自動Content-Type > options.headers）
  const hasContentType =
    (config.headers && typeof config.headers === "object" && "Content-Type" in config.headers) ||
    (options?.headers && typeof options.headers === "object" && "Content-Type" in options.headers);

  const hasCookieHeader =
    (config.headers && typeof config.headers === "object" && "cookie" in config.headers) ||
    (options?.headers && typeof options.headers === "object" && "cookie" in options.headers);

  const serverCookies = !hasCookieHeader ? await getServerCookiesHeader() : undefined;

  const res = await fetch(url, {
    ...options,
    method: config.method,
    credentials: options?.credentials ?? "include",
    headers: {
      ...(config.data && !hasContentType ? { "Content-Type": "application/json" } : {}),
      ...(serverCookies ?? {}),
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
  const data = body ? JSON.parse(body) : null;

  return data as T;
}

async function getServerCookiesHeader(): Promise<HeadersInit | undefined> {
  if (typeof window !== "undefined") return undefined;

  try {
    const { cookies } = await import("next/headers");
    const cookieHeader = cookies().toString();
    return cookieHeader ? { cookie: cookieHeader } : undefined;
  } catch {
    return undefined;
  }
}
