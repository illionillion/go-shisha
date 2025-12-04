"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

/**
 * アプリケーション全体のProviderをまとめるコンポーネント
 * bulletproof-reactパターンに従い、全てのグローバルProviderをここで管理
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // NOTE: QueryClientをステート化してSSR時の再生成を防ぐ
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // デフォルトでは60秒間キャッシュ
            staleTime: 60 * 1000,
            // リトライは1回のみ
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* 将来的に他のProvider（認証、テーマなど）もここに追加 */}
      {children}
    </QueryClientProvider>
  );
}
