import { useGetFlavors as useGetFlavorsGenerated } from "@/api/flavors";
import type { Flavor } from "@/types/domain";

/**
 * フレーバー一覧を取得するカスタムフック
 *
 * TanStack Query を使用してフレーバー一覧をキャッシュ付きで取得します。
 * - キャッシュ期間: 5分（フレーバーは頻繁に変更されないため）
 * - 投稿作成時のフレーバー選択UI（FlavorSelector）で使用
 *
 * @returns TanStack Query の useQuery 結果
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetFlavors();
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <FlavorSelector flavors={data.data} />;
 * ```
 */
export function useGetFlavors() {
  return useGetFlavorsGenerated({
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
 *
 * @param response - useGetFlavors の戻り値
 * @returns Flavor[] または undefined（ローディング中・エラー時）
 */
export function getFlavorsData(response: ReturnType<typeof useGetFlavors>): Flavor[] | undefined {
  // レスポンスがステータス200の場合のみdataにアクセス
  if (response.data && response.data.status === 200) {
    return response.data.data;
  }
  return undefined;
}
