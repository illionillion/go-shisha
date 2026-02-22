"use client";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { CreatePostInput, EditableSlide } from "@/types/domain";
import { useCreatePost } from "../../hooks/useCreatePost";
import { getFlavorsData, useGetFlavors } from "../../hooks/useGetFlavors";
import { useUploadImages } from "../../hooks/useUploadImages";
import { PostCreateFAB } from "../PostCreateFAB";
import { PostCreateForm } from "../PostCreateForm";

/**
 * 投稿作成コンテナ
 *
 * FAB + モーダルUI + hooks統合のクライアントコンポーネント。
 * 認証済みユーザーのみFABを表示し、投稿フローを提供します。
 *
 * @example
 * ```tsx
 * // ページコンポーネントに配置するだけで投稿作成機能が有効になる
 * <PostCreateContainer />
 * ```
 */
export function PostCreateContainer() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** アップロード完了後に投稿作成するためのスライドデータ */
  const [pendingSlides, setPendingSlides] = useState<EditableSlide[] | null>(null);

  const flavorsQuery = useGetFlavors();
  const flavors = getFlavorsData(flavorsQuery);

  const { createPost, isPending: isCreating } = useCreatePost({
    onSuccess: () => {
      setIsOpen(false);
      setIsDirty(false);
      setError(null);
      setPendingSlides(null);
      router.push("/");
    },
    onError: (err) => {
      setError(err);
      setPendingSlides(null);
    },
  });

  const { uploadImages, isPending: isUploading } = useUploadImages({
    onSuccess: (urls) => {
      if (!pendingSlides) return;
      const input: CreatePostInput = {
        slides: pendingSlides.map((slide, i) => ({
          image_url: urls[i],
          text: slide.description || undefined,
          flavor_id: slide.flavorId,
        })),
      };
      createPost(input);
    },
    onError: (err) => {
      setError(err);
      setPendingSlides(null);
    },
  });

  const isSubmitting = isUploading || isCreating;

  /** FABクリック時にモーダルを開く */
  const handleOpen = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  /** モーダルを閉じる（入力途中の場合は確認ダイアログを表示） */
  const handleClose = useCallback(() => {
    if (isDirty) {
      if (!window.confirm("入力中の内容が破棄されます。閉じてもよいですか？")) {
        return;
      }
    }
    setIsOpen(false);
    setIsDirty(false);
    setError(null);
    setPendingSlides(null);
  }, [isDirty]);

  /**
   * バックドロップクリック時の処理
   * 投稿中は無効化する
   */
  const handleBackdropClick = useCallback(() => {
    if (isSubmitting) return;
    handleClose();
  }, [isSubmitting, handleClose]);

  /**
   * フォーム送信処理
   * 1. スライドをstateに保存
   * 2. 画像をアップロード
   * 3. アップロード成功後、onSuccess内でcreatePostを呼ぶ
   */
  const handleSubmit = useCallback(
    (slides: EditableSlide[]) => {
      setError(null);
      setPendingSlides(slides);
      uploadImages(slides.map((s) => s.file));
    },
    [uploadImages]
  );

  /**
   * 入力変化の検知（画像が1枚以上選択されたらdirtyとする）
   */
  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  // 未ログイン時はFABを表示しない
  if (!user) return null;

  return (
    <>
      <PostCreateFAB onClick={handleOpen} />

      {isOpen && (
        <div
          className={clsx([
            "fixed",
            "inset-0",
            "z-50",
            "flex",
            "items-end",
            "sm:items-center",
            "justify-center",
          ])}
          role="dialog"
          aria-modal="true"
          aria-label="投稿作成"
        >
          {/* バックドロップ */}
          <div
            data-testid="post-create-backdrop"
            className={clsx(["fixed", "inset-0", "bg-black/50"])}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* モーダルパネル */}
          <div
            className={clsx([
              "relative",
              "w-full",
              "sm:max-w-2xl",
              "h-[90vh]",
              "sm:max-h-[90vh]",
              "bg-white",
              "rounded-t-2xl",
              "sm:rounded-xl",
              "overflow-hidden",
              "flex",
              "flex-col",
            ])}
          >
            {/* エラーバナー */}
            {error && (
              <div
                role="alert"
                className={clsx([
                  "bg-red-50",
                  "border-b",
                  "border-red-200",
                  "px-6",
                  "py-3",
                  "text-sm",
                  "text-red-700",
                ])}
              >
                {error}
              </div>
            )}

            <PostCreateForm
              flavors={flavors ?? []}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              onDirtyChange={handleDirtyChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}
    </>
  );
}
