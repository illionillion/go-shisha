"use client";
import { useCallback, useEffect, useState } from "react";
import type { EditableSlide, Flavor } from "@/types/domain";
import { ImageUploader } from "../ImageUploader";
import { SlideEditForm } from "./SlideEditForm";

export type PostCreateFormProps = {
  /** フレーバー一覧 */
  flavors: Flavor[];
  /** 投稿作成時のコールバック */
  onSubmit: (slides: EditableSlide[]) => void | Promise<void>;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
  /** 最大画像枚数 */
  maxFiles?: number;
  /** 最大ファイルサイズ（MB） */
  maxSizeMB?: number;
  /** 無効化状態（投稿中等） */
  disabled?: boolean;
};

type Step = "upload" | "edit";

/**
 * 投稿作成フォーム（2ステップ方式）
 *
 * Step 1: 画像選択（ImageUploader）
 * Step 2: 各画像の詳細編集（フレーバー・説明入力）
 *
 * @example
 * ```tsx
 * const { data: flavors } = useGetFlavors();
 * const { mutate: createPost } = useCreatePost();
 *
 * <PostCreateForm
 *   flavors={flavors || []}
 *   onSubmit={(slides) => {
 *     // 画像アップロード → 投稿作成
 *   }}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */
export function PostCreateForm({
  flavors,
  onSubmit,
  onCancel,
  maxFiles = 10,
  maxSizeMB = 10,
  disabled = false,
}: PostCreateFormProps) {
  const [step, setStep] = useState<Step>("upload");
  const [slides, setSlides] = useState<EditableSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // 選択されたファイルからEditableSlideを生成
  const handleFilesSelected = useCallback((files: File[]) => {
    const newSlides: EditableSlide[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      flavorId: undefined,
      description: "",
    }));
    setSlides(newSlides);
  }, []);

  // プレビューURLのクリーンアップ（unmount時のみ）
  useEffect(() => {
    return () => {
      slides.forEach((slide) => URL.revokeObjectURL(slide.previewUrl));
    };
  }, []);

  // Step 1 → Step 2
  const handleNext = useCallback(() => {
    if (slides.length > 0) {
      setStep("edit");
      setCurrentSlideIndex(0);
    }
  }, [slides.length]);

  // Step 2 → Step 1
  const handleBack = useCallback(() => {
    setStep("upload");
    setCurrentSlideIndex(0);
  }, []);

  // スライド更新
  const handleSlideUpdate = useCallback(
    (updatedSlide: EditableSlide) => {
      setSlides((prev) => {
        const newSlides = [...prev];
        newSlides[currentSlideIndex] = updatedSlide;
        return newSlides;
      });
    },
    [currentSlideIndex]
  );

  // 前のスライドへ
  const handlePrevious = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // 次のスライドへ
  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
  }, [slides.length]);

  // 投稿作成
  const handleSubmit = useCallback(async () => {
    await onSubmit(slides);
  }, [slides, onSubmit]);

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">投稿を作成</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="rounded-full p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="閉じる"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {step === "upload" && (
          <div className="space-y-4">
            <ImageUploader
              onFilesSelected={handleFilesSelected}
              maxFiles={maxFiles}
              maxSizeMB={maxSizeMB}
              disabled={disabled}
            />
          </div>
        )}

        {step === "edit" && slides[currentSlideIndex] && (
          <SlideEditForm
            slide={slides[currentSlideIndex]}
            currentIndex={currentSlideIndex + 1}
            totalCount={slides.length}
            flavors={flavors}
            onUpdate={handleSlideUpdate}
            onPrevious={currentSlideIndex > 0 ? handlePrevious : undefined}
            onNext={currentSlideIndex < slides.length - 1 ? handleNextSlide : undefined}
            disabled={disabled}
          />
        )}
      </div>

      {/* フッター */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {step === "upload" && (
            <>
              <div className="text-sm text-gray-600">
                {slides.length > 0 && `${slides.length}枚選択中`}
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={disabled || slides.length === 0}
                className="rounded-md bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                次へ
              </button>
            </>
          )}

          {step === "edit" && (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={disabled}
                className="rounded-md border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                戻る
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled}
                className="rounded-md bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                投稿する
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
