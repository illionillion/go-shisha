import { cookies } from "next/headers";

/**
 * RSC のサーバーサイドフェッチ用のリクエスト初期化オブジェクトを返す。
 * `cache: "no-store"` で常に最新データを取得し、Cookie を転送して
 * 認証情報（is_liked 等）が正しく反映されるようにする。
 */
export async function createServerRequestInit(): Promise<RequestInit> {
  const cookieStore = await cookies();
  return {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  };
}
