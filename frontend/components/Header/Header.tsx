"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/features/auth/components/UserMenu";

/**
 * Headerコンポーネント
 * アプリケーションのヘッダーを表示
 * - 左側: サイトロゴとタイトル
 * - 右側: ユーザーメニュー（ログイン状態に応じて表示変更）
 */
export function Header() {
  const pathname = usePathname();

  // 非表示にするパスを列挙
  const hidePaths = ["/login", "/register"];
  if (pathname && hidePaths.some((p) => pathname.startsWith(p))) return null;

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
      <Link href="/" className={clsx(["flex", "items-center", "space-x-2"])}>
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
      </Link>
      <UserMenu />
    </header>
  );
}
