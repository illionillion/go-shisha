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
  const { user, clearUser, isLoading } = useAuthStore();
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
      // サーバー側のログアウトに失敗した場合はクライアント状態を維持し、ユーザーにエラーを通知する
      if (typeof window !== "undefined") {
        window.alert("ログアウトに失敗しました。時間をおいて再度お試しください。");
      }
    },
  });

  // 外側クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  // 初回ハイドレーション中はプレースホルダ（スピナー）を表示
  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <span role="status" aria-label="読み込み中" className="inline-flex items-center">
          <svg
            className="animate-spin h-5 w-5 text-gray-200"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </span>
      </div>
    );
  }

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
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar src={user.icon_url} alt={user.display_name || "ユーザー"} size={40} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <Link
            href={`/profile/${user.id}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
            role="menuitem"
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
            role="menuitem"
          >
            {isPending ? "ログアウト中..." : "ログアウト"}
          </button>
        </div>
      )}
    </div>
  );
};
