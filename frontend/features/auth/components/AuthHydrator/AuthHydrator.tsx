"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGetAuthMeQueryOptions } from "@/api/auth";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { ApiError } from "@/lib/api-client";

/**
 * Cookieベース認証の状態を初期化するためのハイドレーション（hydration）コンポーネント。
 * - /auth/me を1回叩いてユーザーをstoreに反映
 * - 401なら明示的にサインアウト扱いにする
 */
export const AuthHydrator = () => {
  const { setUser, clearUser } = useAuthStore();

  const { data, error } = useQuery({
    ...getGetAuthMeQueryOptions(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5分
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      return;
    }

    const apiError = error as ApiError | undefined;
    if (!apiError) {
      return;
    }

    // 401の場合は明示的にサインアウト扱いにする
    if (apiError.status === 401) {
      clearUser();
      return;
    }

    // それ以外のエラー（500、ネットワークエラーなど）でも
    // ストアの不整合を避けるために一旦ユーザー情報をクリアする
    clearUser();
  }, [data?.user, error, setUser, clearUser]);

  return null;
};
