"use client";

import { clsx } from "clsx";
import { useGetPosts } from "@/api/posts";

export function ClientComponent() {
  // TanStack Queryのhooksを使用（自動的にローディング・エラー管理）
  const { data, error, isLoading } = useGetPosts();

  return (
    <div>
      <h2 className={clsx(["text-xl", "font-semibold", "mb-2"])}>🌐 クライアント側（ブラウザ）からのAPI呼び出し</h2>
      <p className={clsx(["text-sm", "text-gray-600", "mb-2"])}>使用URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      <p className={clsx(["text-xs", "text-gray-500", "mb-2"])}>
        ✨ TanStack Query使用（自動キャッシュ・リトライ・ポーリング対応）
      </p>
      {isLoading ? (
        <div className={clsx(["bg-gray-100", "p-4", "rounded"])}>
          <p>読み込み中...</p>
        </div>
      ) : error ? (
        <div className={clsx(["bg-red-100", "p-4", "rounded"])}>
          <p className={clsx(["text-red-700"])}>
            エラー: {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      ) : (
        <div className={clsx(["bg-blue-100", "p-4", "rounded"])}>
          <p className={clsx(["text-blue-700"])}>成功！</p>
          <pre className={clsx(["text-xs", "mt-2", "overflow-auto"])}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
