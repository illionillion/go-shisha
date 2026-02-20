"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { clsx } from "clsx";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { LoginInput } from "@/types/auth";
import { loginInputSchema } from "@/types/auth";

/**
 * LoginFormコンポーネントのProps
 */
export interface LoginFormProps {
  /** ログイン処理のコールバック */
  onSubmit: (data: LoginInput) => Promise<void> | void;
  /** ローディング状態 */
  isLoading?: boolean;
  /** サーバーエラーメッセージ */
  errorMessage?: string;
  /** register へのリンクを上書きする（例: `/register?redirectUrl=...`） */
  registerHref?: string;
}

/**
 * ログインフォームコンポーネント
 *
 * @description
 * メール・パスワードを入力してログインするフォーム。
 * React Hook Form + zodによるバリデーション実装。
 *
 * @example
 * ```tsx
 * <LoginForm
 *   onSubmit={async (data) => { await login(data); }}
 *   isLoading={false}
 * />
 * ```
 */
export const LoginForm = ({
  onSubmit,
  isLoading = false,
  errorMessage,
  registerHref,
}: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
  });

  return (
    <div className={clsx(["w-full", "rounded-lg", "bg-white", "p-8", "shadow-2xl"])}>
      <h2 className={clsx(["mb-6", "text-2xl", "font-bold"])}>ログイン</h2>

      {errorMessage && (
        <div
          className={clsx(["mb-4", "rounded-md", "bg-red-50", "p-3", "text-sm", "text-red-600"])}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={clsx(["space-y-4"])}>
        {/* メールアドレス */}
        <div>
          <label
            htmlFor="email"
            className={clsx(["block", "text-sm", "font-medium", "text-gray-700"])}
          >
            メールアドレス
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className={clsx([
              "mt-1",
              "block",
              "w-full",
              "rounded-md",
              "border",
              "border-gray-300",
              "px-3",
              "py-2",
              "shadow-sm",
              "focus:border-purple-500",
              "focus:outline-none",
              "focus:ring-purple-500",
            ])}
            placeholder="your@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className={clsx(["mt-1", "text-sm", "text-red-600"])}>{errors.email.message}</p>
          )}
        </div>

        {/* パスワード */}
        <div>
          <label
            htmlFor="password"
            className={clsx(["block", "text-sm", "font-medium", "text-gray-700"])}
          >
            パスワード
          </label>
          <input
            {...register("password")}
            id="password"
            type="password"
            className={clsx([
              "mt-1",
              "block",
              "w-full",
              "rounded-md",
              "border",
              "border-gray-300",
              "px-3",
              "py-2",
              "shadow-sm",
              "focus:border-purple-500",
              "focus:outline-none",
              "focus:ring-purple-500",
            ])}
            placeholder="••••••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className={clsx(["mt-1", "text-sm", "text-red-600"])}>{errors.password.message}</p>
          )}
        </div>

        {/* ログインボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className={clsx([
            "w-full",
            "rounded-md",
            "bg-purple-600",
            "px-4",
            "py-2",
            "text-white",
            "hover:bg-purple-700",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          ])}
        >
          {isLoading ? "ログイン中..." : "ログイン"}
        </button>

        {/* 登録リンク */}
        <div className={clsx(["text-center", "text-sm", "text-gray-600"])}>
          アカウントをお持ちでない方は
          <Link
            href={registerHref ?? "/register"}
            className={clsx(["ml-1", "text-purple-600", "hover:underline"])}
          >
            こちら
          </Link>
        </div>
      </form>
    </div>
  );
};
