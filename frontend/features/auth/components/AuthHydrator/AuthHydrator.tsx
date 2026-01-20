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

  const { data, error, isError } = useQuery({
    ...getGetAuthMeQueryOptions(),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5分
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      return;
    }

    if (!isError) {
      return;
    }

    const apiError = error as ApiError | undefined;
    if (!apiError) {
      return;
    }

    // 401の場合のみ明示的にサインアウト扱いにする
    // 500系エラーは一時的な障害の可能性があるためストアは維持
    if (apiError.status === 401) {
      clearUser();
    }
  }, [data?.user, error, isError, setUser, clearUser]);

  return null;
};
