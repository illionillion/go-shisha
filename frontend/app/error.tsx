"use client";

import { useEffect } from "react";

/**
 * エラーページ
 * アプリケーション全体のエラーをキャッチして表示
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">エラーが発生しました</h1>
        <p className="mb-8 text-gray-600">
          申し訳ございません。問題が発生しました。
          <br />
          しばらく時間をおいてから再度お試しください。
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
