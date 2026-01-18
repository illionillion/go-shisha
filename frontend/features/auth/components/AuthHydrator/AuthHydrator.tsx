"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGetAuthMeQueryOptions } from "@/api/auth";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { ApiError } from "@/lib/api-client";

/**
 * Cookieベース認証の状態を初期化するための水和コンポーネント。
 * - /auth/me を1回叩いてユーザーをstoreに反映
 * - 401なら明示的にサインアウト扱いにする
 */
export const AuthHydrator = () => {
  const { setUser, clearUser } = useAuthStore();

  const { data, error } = useQuery({
    ...getGetAuthMeQueryOptions(),
    retry: 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      return;
    }

    const apiError = error as ApiError | undefined;
    if (apiError?.status === 401) {
      clearUser();
    }
  }, [data?.user, error, setUser, clearUser]);

  return null;
};
