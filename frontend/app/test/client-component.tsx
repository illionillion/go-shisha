"use client";

import { useEffect, useState } from "react";
import { getPosts } from "@/api/posts";

export function ClientComponent() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">🌐 クライアント側（ブラウザ）からのAPI呼び出し</h2>
      <p className="text-sm text-gray-600 mb-2">使用URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      {loading ? (
        <div className="bg-gray-100 p-4 rounded">
          <p>読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">エラー: {error}</p>
        </div>
      ) : (
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-blue-700">成功！</p>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
