/**
 * Server Component 内で Cookie ヘッダーを取得する
 * 呼び出し元で api-client.ts の apiFetch に渡すヘッダーに統合する
 */
export async function getServerCookiesHeader(): Promise<Record<string, string> | undefined> {
  if (typeof window !== "undefined") return undefined;

  try {
    const { cookies } = await import("next/headers");
    const cookieHeader = cookies().toString();
    return cookieHeader ? { cookie: cookieHeader } : undefined;
  } catch {
    return undefined;
  }
}
