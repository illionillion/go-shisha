"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getGetAuthMeQueryOptions } from "@/api/auth";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { ApiError } from "@/lib/api-client";
import { isSuccessResponse } from "@/lib/api-helpers";

// ログイン・新規登録ページなど、/auth/me の認証チェックをスキップするパス
// NOTE:
// - 主目的は、これらのページでの /auth/me アクセスを抑制し、rate limit を回避すること
// - middleware.ts の PUBLIC_PATHS（認証不要のパブリックパス一覧）とは用途が異なるため、あえて同期させていない
const SKIP_AUTH_CHECK_PATHS = ["/login", "/register"];

/**
 * Cookieベース認証の状態を初期化するためのハイドレーション（hydration）コンポーネント。
 * - /auth/me を1回叩いてユーザーをstoreに反映
 * - 401なら明示的にサインアウト扱いにする
 * - ログインページ等では実行をスキップしてrate limit回避
 */
export const AuthHydrator = () => {
  const pathname = usePathname();
  const { setUser, clearUser, setIsLoading } = useAuthStore();

  // ログインページなどでは認証チェックをスキップ
  const shouldSkip = SKIP_AUTH_CHECK_PATHS.includes(pathname || "");

  const { data, error, isError } = useQuery({
    ...getGetAuthMeQueryOptions(),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5分
    enabled: !shouldSkip, // スキップ対象のページでは実行しない
  });

  useEffect(() => {
    if (shouldSkip) {
      // 認証チェックをスキップするパスではハイドレーションは不要
      setIsLoading(false);
      return;
    }

    // 実行開始時は読み込み中フラグを true にしておく
    setIsLoading(true);

    if (data && isSuccessResponse(data) && data.data.user) {
      setUser(data.data.user);
      setIsLoading(false);
      return;
    }

    if (!isError) {
      // クエリがまだ解決していない場合はそのまま
      return;
    }

    const apiError = error as ApiError | undefined;
    if (!apiError) {
      setIsLoading(false);
      return;
    }

    // 401の場合のみ明示的にサインアウト扱いにする
    // 500系エラーは一時的な障害の可能性があるためストアは維持
    if (apiError.status === 401) {
      clearUser();
    }

    setIsLoading(false);
  }, [shouldSkip, data, error, isError, setUser, clearUser, setIsLoading]);

  return null;
};
