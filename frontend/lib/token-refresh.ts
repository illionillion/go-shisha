import { useAuthStore } from "@/features/auth/stores/authStore";
import { getApiBaseUrl } from "./api-client";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * リフレッシュトークンを使って新しいアクセストークンを取得
 * 複数のリクエストが同時に401を受け取った場合も、リフレッシュは1回だけ実行される
 * @returns リフレッシュ成功時 true、失敗時 false
 */
export async function tryRefreshToken(): Promise<boolean> {
  // 既にリフレッシュ中の場合は、その結果を待つ
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = performRefresh();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

async function performRefresh(): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      // リフレッシュ成功（新しいaccess_tokenがCookieに設定される）
      return true;
    }

    // リフレッシュトークンも無効（ログアウト状態）
    // authStoreをクリアして、ユーザーをログアウト状態にする
    useAuthStore.getState().clearUser();
    return false;
  } catch (error) {
    // ネットワークエラー等でもログアウト状態にする
    console.error("Token refresh failed:", error);
    useAuthStore.getState().clearUser();
    return false;
  }
}
