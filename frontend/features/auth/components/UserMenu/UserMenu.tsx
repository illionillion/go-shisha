"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/stores/authStore";

/**
 * ユーザーメニューコンポーネント
 * - ログイン済み: アバター表示、クリックでドロップダウン（プロフィール、ログアウト）
 * - 未ログイン: ログインボタン表示
 */
export const UserMenu = () => {
  const { user, clearUser } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { mutate: logout, isPending } = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      router.push("/login");
    },
    onError: (error) => {
      console.error("UserMenu: logout failed", error);
      // エラーでも強制的にクライアント側をクリア
      clearUser();
      router.push("/login");
    },
  });

  // 外側クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 未ログイン状態
  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        ログイン
      </Link>
    );
  }

  // ログイン済み状態
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
        aria-label="ユーザーメニュー"
      >
        <Avatar src={user.icon_url} alt={user.display_name || "ユーザー"} size={40} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <Link
            href={`/profile/${user.id}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            プロフィール
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            disabled={isPending}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
          >
            {isPending ? "ログアウト中..." : "ログアウト"}
          </button>
        </div>
      )}
    </div>
  );
};
