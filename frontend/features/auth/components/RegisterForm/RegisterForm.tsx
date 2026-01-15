"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { RegisterInput } from "@/types/auth";
import { registerInputSchema } from "@/types/auth";

/**
 * RegisterFormコンポーネントのProps
 */
export interface RegisterFormProps {
  /** 登録処理のコールバック */
  onSubmit: (data: RegisterInput) => Promise<void> | void;
  /** ローディング状態 */
  isLoading?: boolean;
  /** サーバーエラーメッセージ */
  errorMessage?: string;
}

/**
 * パスワード強度を計算する関数
 */
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 12) strength += 25;
  if (password.length >= 16) strength += 25;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
  return Math.min(strength, 100);
};

/**
 * パスワード強度インジケーターコンポーネント
 */
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = calculatePasswordStrength(password);

  const getColor = () => {
    if (strength < 40) return "bg-red-500";
    if (strength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getLabel = () => {
    if (strength < 40) return "弱い";
    if (strength < 70) return "普通";
    return "強い";
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all ${getColor()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{getLabel()}</span>
      </div>
    </div>
  );
};

/**
 * 登録フォームコンポーネント
 *
 * @description
 * メール・パスワード・確認・表示名を入力して登録するフォーム。
 * React Hook Form + zodによるバリデーション実装。
 * パスワード強度インジケーター付き。
 *
 * @example
 * ```tsx
 * <RegisterForm
 *   onSubmit={async (data) => { await register(data); }}
 *   isLoading={false}
 * />
 * ```
 */
export const RegisterForm = ({ onSubmit, isLoading = false, errorMessage }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema),
  });

  const password = watch("password", "");

  return (
    <div className="w-full rounded-lg bg-white p-8 shadow-2xl">
      <h2 className="mb-6 text-2xl font-bold">登録</h2>

      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            placeholder="your@email.com"
            disabled={isLoading}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* 表示名 */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            表示名
          </label>
          <input
            {...register("displayName")}
            id="displayName"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            placeholder="山田太郎"
            disabled={isLoading}
          />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
          )}
        </div>

        {/* パスワード */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            {...register("password")}
            id="password"
            type="password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            placeholder="••••••••••••"
            disabled={isLoading}
          />
          <PasswordStrengthIndicator password={password} />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* パスワード（確認） */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            パスワード（確認）
          </label>
          <input
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            placeholder="••••••••••••"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* 登録ボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "登録中..." : "登録"}
        </button>

        {/* ログインリンク */}
        <div className="text-center text-sm text-gray-600">
          既にアカウントをお持ちの方は
          <Link href="/login" className="ml-1 text-purple-600 hover:underline">
            こちら
          </Link>
        </div>
      </form>
    </div>
  );
};
