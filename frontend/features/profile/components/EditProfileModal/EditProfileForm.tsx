"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { clsx } from "clsx";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DefaultAvatar from "@/components/Avatar/DefaultAvatar";
import { XIcon } from "@/components/icons";
import { getImageUrl } from "@/lib/getImageUrl";
import type { UpdateUserInput, User } from "@/types/domain";

/** プロフィール編集フォームのバリデーションスキーマ */
const editProfileSchema = z.object({
  display_name: z.string().max(50, "表示名は50文字以内で入力してください"),
  description: z.string().max(200, "自己紹介は200文字以内で入力してください"),
  external_url: z.union([
    z.string().url("URLはhttp://またはhttps://で始まる必要があります"),
    z.literal(""),
  ]),
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
  /**
   * アバター画像のアップロード関数。
   * ファイルを受け取り、アップロード後のURLをPromiseで返す。
   * 未指定の場合はアバター変更UIを非表示にする。
   */
  onUploadImage?: (file: File) => Promise<string>;
  /** アバターアップロード中フラグ */
  isUploading?: boolean;
  /** アバターアップロードエラーメッセージ */
  uploadError?: string;
};

/**
 * プロフィール編集フォーム
 *
 * display_name / description / external_url を編集し、
 * アバター画像はクリックでファイル選択→アップロードAPIへ送信するUI。
 * React Hook Form + Zodによるバリデーション実装。
 */
export function EditProfileForm({
  initialUser,
  onSubmit,
  onCancel,
  disabled = false,
  errorMessage,
  onUploadImage,
  isUploading = false,
  uploadError,
}: EditProfileFormProps) {
  /** アバタープレビューURL（blob URL or サーバーURL） */
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialUser.icon_url ? getImageUrl(initialUser.icon_url) : undefined
  );
  /** アップロード済みアイコンURL（保存時に使用） */
  const [uploadedIconUrl, setUploadedIconUrl] = useState<string | undefined>(
    initialUser.icon_url ?? undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    },
  });

  /** アバタークリックでファイル選択ダイアログを開く */
  const handleAvatarClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  /** ファイル選択後: プレビュー即時更新 → アップロード → URLを保持 */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const url = await onUploadImage(file);
      setUploadedIconUrl(url);
      setPreviewUrl(getImageUrl(url));
    } catch {
      // アップロード失敗時はプレビューを直前の確定状態に戻す
      setPreviewUrl(uploadedIconUrl ? getImageUrl(uploadedIconUrl) : undefined);
    } finally {
      // blob URLを解放
      URL.revokeObjectURL(objectUrl);
    }
    // 同じファイルを再選択できるようにリセット
    e.target.value = "";
  };

  const isFormDisabled = disabled || isUploading;

  const handleFormSubmit = (values: EditProfileFormValues) => {
    const input: UpdateUserInput = {
      display_name: values.display_name,
      description: values.description,
      external_url: values.external_url,
      icon_url: uploadedIconUrl,
    };
    onSubmit(input);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={clsx(["flex", "flex-col", "h-full"])}
    >
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
            disabled={isFormDisabled}
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
            className={clsx(["mb-4", "rounded-md", "bg-red-50", "p-3", "text-sm", "text-red-600"])}
          >
            {errorMessage}
          </div>
        )}

        <div className={clsx(["space-y-5"])}>
          {/* アバター画像 */}
          {onUploadImage && (
            <div className={clsx(["flex", "flex-col", "items-center", "gap-2"])}>
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isFormDisabled}
                aria-label="プロフィール画像を変更"
                className={clsx([
                  "relative",
                  "rounded-full",
                  "overflow-hidden",
                  "focus:outline-none",
                  "focus:ring-2",
                  "focus:ring-purple-500",
                  "focus:ring-offset-2",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-60",
                  "group",
                ])}
              >
                {previewUrl ? (
                  <div className="relative h-20 w-20 rounded-full overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="プロフィール画像"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    <div
                      className={clsx([
                        "absolute",
                        "inset-0",
                        "flex",
                        "items-center",
                        "justify-center",
                        "bg-black/40",
                        "opacity-0",
                        "group-hover:opacity-100",
                        "transition-opacity",
                      ])}
                    >
                      <span className={clsx(["text-xs", "text-white", "font-medium"])}>変更</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <DefaultAvatar size={80} />
                    <div
                      className={clsx([
                        "absolute",
                        "inset-0",
                        "flex",
                        "items-center",
                        "justify-center",
                        "rounded-full",
                        "bg-black/40",
                        "opacity-0",
                        "group-hover:opacity-100",
                        "transition-opacity",
                      ])}
                    >
                      <span className={clsx(["text-xs", "text-white", "font-medium"])}>変更</span>
                    </div>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="プロフィール画像ファイル選択"
              />
              {isUploading && (
                <p className={clsx(["text-xs", "text-gray-500"])}>アップロード中...</p>
              )}
              {uploadError && (
                <p role="alert" className={clsx(["text-xs", "text-red-600"])}>
                  {uploadError}
                </p>
              )}
            </div>
          )}

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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
            disabled={isFormDisabled}
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
          disabled={isFormDisabled}
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
