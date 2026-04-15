"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { XIcon } from "@/components/icons";
import type { UpdateUserInput, User } from "@/types/domain";

/** プロフィール編集フォームのバリデーションスキーマ */
const editProfileSchema = z.object({
  display_name: z.string().max(50, "表示名は50文字以内で入力してください"),
  description: z.string().max(200, "自己紹介は200文字以内で入力してください"),
  external_url: z.union([
    z.string().url("URLはhttp://またはhttps://で始まる必要があります"),
    z.literal(""),
  ]),
  icon_url: z.string(),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export type EditProfileFormProps = {
  /** 編集前のユーザー情報（フォームの初期値に使用） */
  initialUser: Pick<User, "display_name" | "description" | "external_url" | "icon_url">;
  /** 保存時のコールバック */
  onSubmit: (input: UpdateUserInput) => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
  /** 無効化状態（保存中等） */
  disabled?: boolean;
  /** サーバーエラーメッセージ */
  errorMessage?: string;
};

/**
 * プロフィール編集フォーム
 *
 * display_name / description / external_url / icon_url を編集するUI。
 * React Hook Form + Zodによるバリデーション実装。
 */
export function EditProfileForm({
  initialUser,
  onSubmit,
  onCancel,
  disabled = false,
  errorMessage,
}: EditProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: initialUser.display_name ?? "",
      description: initialUser.description ?? "",
      external_url: initialUser.external_url ?? "",
      icon_url: initialUser.icon_url ?? "",
    },
  });

  const handleFormSubmit = (values: EditProfileFormValues) => {
    const input: UpdateUserInput = {
      display_name: values.display_name || undefined,
      description: values.description || undefined,
      external_url: values.external_url || undefined,
      icon_url: values.icon_url || undefined,
    };
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={clsx(["flex", "flex-col", "h-full"])}>
      {/* ヘッダー */}
      <div
        className={clsx([
          "flex",
          "items-center",
          "justify-between",
          "px-6",
          "py-4",
          "border-b",
          "border-gray-200",
        ])}
      >
        <h2 className={clsx(["text-lg", "font-semibold"])}>プロフィールを編集</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="閉じる"
            disabled={disabled}
            className={clsx([
              "p-1",
              "rounded",
              "text-gray-500",
              "hover:bg-gray-100",
              "disabled:cursor-not-allowed",
            ])}
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* フォームボディ */}
      <div className={clsx(["flex-1", "overflow-y-auto", "px-6", "py-6"])}>
        {errorMessage && (
          <div
            role="alert"
            className={clsx([
              "mb-4",
              "rounded-md",
              "bg-red-50",
              "p-3",
              "text-sm",
              "text-red-600",
            ])}
          >
            {errorMessage}
          </div>
        )}

        <div className={clsx(["space-y-5"])}>
          {/* 表示名 */}
          <div>
            <label
              htmlFor="display_name"
              className={clsx(["block", "text-sm", "font-medium", "text-gray-700"])}
            >
              表示名
            </label>
            <input
              {...register("display_name")}
              id="display_name"
              type="text"
              disabled={disabled}
              maxLength={50}
              placeholder="例: 山田 太郎"
              className={clsx([
                "mt-1",
                "block",
                "w-full",
                "rounded-md",
                "border",
                "border-gray-300",
                "px-3",
                "py-2",
                "text-sm",
                "shadow-sm",
                "focus:border-purple-500",
                "focus:outline-none",
                "focus:ring-1",
                "focus:ring-purple-500",
                "disabled:cursor-not-allowed",
                "disabled:bg-gray-100",
              ])}
            />
            {errors.display_name && (
              <p className={clsx(["mt-1", "text-sm", "text-red-600"])}>
                {errors.display_name.message}
              </p>
            )}
          </div>

          {/* 自己紹介 */}
          <div>
            <label
              htmlFor="description"
              className={clsx(["block", "text-sm", "font-medium", "text-gray-700"])}
            >
              自己紹介
            </label>
            <textarea
              {...register("description")}
              id="description"
              disabled={disabled}
              rows={4}
              maxLength={200}
              placeholder="例: シーシャ好きのエンジニア"
              className={clsx([
                "mt-1",
                "block",
                "w-full",
                "rounded-md",
                "border",
                "border-gray-300",
                "px-3",
                "py-2",
                "text-sm",
                "shadow-sm",
                "focus:border-purple-500",
                "focus:outline-none",
                "focus:ring-1",
                "focus:ring-purple-500",
                "disabled:cursor-not-allowed",
                "disabled:bg-gray-100",
              ])}
            />
            {errors.description && (
              <p className={clsx(["mt-1", "text-sm", "text-red-600"])}>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 外部URL */}
          <div>
            <label
              htmlFor="external_url"
              className={clsx(["block", "text-sm", "font-medium", "text-gray-700"])}
            >
              外部URL
            </label>
            <input
              {...register("external_url")}
              id="external_url"
              type="text"
              disabled={disabled}
              placeholder="https://example.com"
              className={clsx([
                "mt-1",
                "block",
                "w-full",
                "rounded-md",
                "border",
                "border-gray-300",
                "px-3",
                "py-2",
                "text-sm",
                "shadow-sm",
                "focus:border-purple-500",
                "focus:outline-none",
                "focus:ring-1",
                "focus:ring-purple-500",
                "disabled:cursor-not-allowed",
                "disabled:bg-gray-100",
              ])}
            />
            {errors.external_url && (
              <p className={clsx(["mt-1", "text-sm", "text-red-600"])}>
                {errors.external_url.message}
              </p>
            )}
          </div>

          {/* アイコン画像URL */}
          <div>
            <label
              htmlFor="icon_url"
              className={clsx(["block", "text-sm", "font-medium", "text-gray-700"])}
            >
              アイコン画像URL
            </label>
            <input
              {...register("icon_url")}
              id="icon_url"
              type="text"
              disabled={disabled}
              placeholder="https://example.com/avatar.png"
              className={clsx([
                "mt-1",
                "block",
                "w-full",
                "rounded-md",
                "border",
                "border-gray-300",
                "px-3",
                "py-2",
                "text-sm",
                "shadow-sm",
                "focus:border-purple-500",
                "focus:outline-none",
                "focus:ring-1",
                "focus:ring-purple-500",
                "disabled:cursor-not-allowed",
                "disabled:bg-gray-100",
              ])}
            />
            {errors.icon_url && (
              <p className={clsx(["mt-1", "text-sm", "text-red-600"])}>
                {errors.icon_url.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div
        className={clsx([
          "flex",
          "justify-end",
          "gap-3",
          "px-6",
          "py-4",
          "border-t",
          "border-gray-200",
        ])}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className={clsx([
              "px-4",
              "py-2",
              "rounded-md",
              "text-sm",
              "font-medium",
              "text-gray-700",
              "bg-gray-100",
              "hover:bg-gray-200",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
            ])}
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={disabled}
          className={clsx([
            "px-4",
            "py-2",
            "rounded-md",
            "text-sm",
            "font-medium",
            "text-white",
            "bg-purple-600",
            "hover:bg-purple-700",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          ])}
        >
          {disabled ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
