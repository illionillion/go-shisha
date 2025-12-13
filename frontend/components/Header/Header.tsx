import { clsx } from "clsx";

/**
 * Headerコンポーネント
 * アプリケーションのヘッダーを表示
 * - 左側: サイトロゴとタイトル
 * - 右側: ユーザーアイコン
 */
export function Header() {
  return (
    <header
      className={clsx([
        "sticky",
        "top-0",
        "z-50",
        "flex",
        "items-center",
        "justify-between",
        "p-4",
        "bg-white",
        "border-b",
        "border-gray-200",
      ])}
    >
      <div className={clsx(["flex", "items-center", "space-x-2"])}>
        <div
          className={clsx([
            "w-8",
            "h-8",
            "bg-gradient-to-br",
            "from-green-400",
            "to-blue-500",
            "rounded-full",
            "flex",
            "items-center",
            "justify-center",
          ])}
        >
          <span className={clsx(["text-white", "font-bold", "text-sm"])}>S</span>
        </div>
        <h1 className={clsx(["text-xl", "font-bold", "text-gray-900"])}>シーシャ行こう</h1>
      </div>
      <div
        className={clsx([
          "w-8",
          "h-8",
          "bg-gray-200",
          "rounded-full",
          "flex",
          "items-center",
          "justify-center",
        ])}
      >
        <svg
          className={clsx(["w-5", "h-5", "text-gray-600"])}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </header>
  );
}
