import type { getFlavors } from "@/api/flavors";
import { useGetFlavors as useGetFlavorsGenerated } from "@/api/flavors";
import type { ApiError } from "@/lib/api-client";
import { isSuccessResponse } from "@/lib/api-helpers";
import type { Flavor } from "@/types/domain";

/**
 * フレーバー一覧を取得するカスタムフック
 *
 * TanStack Query を使用してフレーバー一覧をキャッシュ付きで取得します。
 * - キャッシュ設定: staleTime: 5分 / gcTime: 10分（フレーバーは頻繁に変更されないため）
 * - 投稿作成時のフレーバー選択UI（FlavorSelector）で使用
 *
 * @returns TanStack Query の useQuery 結果
 * @example
 * ```tsx
 * const query = useGetFlavors();
 * const flavors = getFlavorsData(query);
 *
 * if (query.isLoading) return <div>Loading...</div>;
 * if (query.error) return <div>フレーバーの取得に失敗しました</div>;
 * if (!flavors) return null;
 *
 * return <FlavorSelector flavors={flavors} />;
 * ```
 */
export function useGetFlavors() {
  return useGetFlavorsGenerated<Awaited<ReturnType<typeof getFlavors>>, ApiError>({
    query: {
      // フレーバー一覧は頻繁に変更されないため、5分間キャッシュを有効とする
      staleTime: 5 * 60 * 1000, // 5分
      // 未使用キャッシュは10分間保持
      gcTime: 10 * 60 * 1000, // 10分
      // エラー時のデフォルト動作（自動リトライはオフ）
      retry: false,
    },
  });
}

/**
 * useGetFlavors フックの戻り値からフレーバー配列を取得するヘルパー関数
 *
 * API レスポンスの data.data から Flavor[] を安全に取得します。
 * エラー時や成功レスポンスではない場合は undefined を返します。
 *
 * @param response - useGetFlavors の戻り値
 * @returns Flavor[] または undefined（ローディング中・エラー時・非成功レスポンス時）
 */
export function getFlavorsData(response: ReturnType<typeof useGetFlavors>): Flavor[] | undefined {
  // エラー状態の場合は undefined を返す（TanStack Query がキャッシュデータを保持していても安全）
  if (response.isError || !response.data) {
    return undefined;
  }
  // レスポンスが成功（2xx）の場合のみdataにアクセス
  if (isSuccessResponse(response.data)) {
    return response.data.data;
  }
  return undefined;
}
