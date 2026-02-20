import { clsx } from "clsx";
import Link from "next/link";

/**
 * 404ページ
 * 存在しないページにアクセスした際に表示
 */
export default function NotFound() {
  return (
    <div
      className={clsx([
        "flex",
        "min-h-screen",
        "flex-col",
        "items-center",
        "justify-center",
        "px-4",
      ])}
    >
      <div className={clsx(["text-center"])}>
        <h1 className={clsx(["mb-4", "text-6xl", "font-bold", "text-gray-900"])}>404</h1>
        <h2 className={clsx(["mb-4", "text-2xl", "font-semibold", "text-gray-700"])}>
          ページが見つかりません
        </h2>
        <p className={clsx(["mb-8", "text-gray-600"])}>
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className={clsx([
            "inline-block",
            "rounded-lg",
            "bg-blue-500",
            "px-6",
            "py-3",
            "font-medium",
            "text-white",
            "transition-colors",
            "hover:bg-blue-600",
          ])}
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
