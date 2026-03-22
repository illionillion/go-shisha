"use client";
import { clsx } from "clsx";
import Image from "next/image";
import { useCallback, useState } from "react";
import { NextIcon, PrevIcon, XIcon } from "@/components/icons";
import { getImageUrl } from "@/lib/getImageUrl";
import type { Flavor, Slide, UpdateSlideInput } from "@/types/domain";
import { FlavorSelector } from "../FlavorSelector";

export type EditablePostSlide = {
  /** スライドID */
  id: number;
  /** 画像URL */
  imageUrl: string;
  /** テキスト（最大100文字） */
  text: string;
  /** 選択中のフレーバーID（未選択時はundefined） */
  flavorId?: number;
};

export type EditPostFormProps = {
  /** 編集対象の投稿ID */
  postId: number;
  /** 既存のスライド一覧 */
  slides: Slide[];
  /** フレーバー一覧 */
  flavors: Flavor[];
  /** 保存時のコールバック */
  onSubmit: (postId: number, input: { slides: UpdateSlideInput[] }) => void | Promise<void>;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
  /** 無効化状態（保存中等） */
  disabled?: boolean;
};

/**
 * 投稿編集フォーム
 *
 * 既存スライドのテキスト・フレーバーを編集するUI。
 * 画像の変更は非対応。
 */
export function EditPostForm({
  postId,
  slides,
  flavors,
  onSubmit,
  onCancel,
  disabled = false,
}: EditPostFormProps) {
  const [editableSlides, setEditableSlides] = useState<EditablePostSlide[]>(() =>
    slides
      .filter((s): s is Slide & { id: number } => s.id !== undefined)
      .map((s) => ({
        id: s.id,
        imageUrl: s.image_url,
        text: s.text ?? "",
        flavorId: s.flavor?.id,
      }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSlide = editableSlides[currentIndex];
  const totalCount = editableSlides.length;

  const handleFlavorChange = useCallback(
    (flavorId: number | undefined) => {
      setEditableSlides((prev) =>
        prev.map((s, i) => (i === currentIndex ? { ...s, flavorId } : s))
      );
    },
    [currentIndex]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      if (text.length <= 100) {
        setEditableSlides((prev) => prev.map((s, i) => (i === currentIndex ? { ...s, text } : s)));
      }
    },
    [currentIndex]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slideInputs: UpdateSlideInput[] = editableSlides.map((s) => ({
      id: s.id,
      text: s.text,
      flavor_id: s.flavorId,
    }));
    onSubmit(postId, { slides: slideInputs });
  };

  if (!currentSlide) return null;

  return (
    <form onSubmit={handleSubmit} className={clsx(["flex", "flex-col", "h-full"])}>
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
        <h2 className={clsx(["text-lg", "font-semibold"])}>投稿を編集</h2>
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

      {/* スライドコンテンツ */}
      <div className={clsx(["flex-1", "overflow-y-auto", "px-6", "py-6"])}>
        <div className={clsx(["flex", "flex-col", "gap-6"])}>
          {/* スライドナビゲーション */}
          <div className={clsx(["flex", "items-center", "justify-between"])}>
            <h3 className={clsx(["text-lg", "font-semibold"])}>
              スライド {currentIndex + 1} / {totalCount}
            </h3>
            {totalCount > 1 && (
              <div className={clsx(["flex", "gap-2"])}>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  disabled={disabled || currentIndex === 0}
                  aria-label="前のスライド"
                  className={clsx([
                    "rounded-md",
                    "bg-gray-200",
                    "px-3",
                    "py-1",
                    "text-sm",
                    "font-medium",
                    "text-gray-700",
                    "hover:bg-gray-300",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                    "flex",
                    "items-center",
                    "gap-1",
                  ])}
                >
                  <PrevIcon className="text-gray-700" />前
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  disabled={disabled || currentIndex === totalCount - 1}
                  aria-label="次のスライド"
                  className={clsx([
                    "rounded-md",
                    "bg-gray-200",
                    "px-3",
                    "py-1",
                    "text-sm",
                    "font-medium",
                    "text-gray-700",
                    "hover:bg-gray-300",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                    "flex",
                    "items-center",
                    "gap-1",
                  ])}
                >
                  次
                  <NextIcon className="text-gray-700" />
                </button>
              </div>
            )}
          </div>

          {/* 画像プレビュー */}
          <div
            className={clsx([
              "relative",
              "aspect-square",
              "w-full",
              "overflow-hidden",
              "rounded-lg",
              "bg-gray-100",
            ])}
          >
            <Image
              src={getImageUrl(currentSlide.imageUrl)}
              alt={`スライド ${currentIndex + 1}`}
              fill
              className={clsx(["object-contain"])}
            />
          </div>

          {/* フレーバー選択 */}
          <div>
            <label className={clsx(["mb-2", "block", "text-sm", "font-medium", "text-gray-700"])}>
              フレーバー（オプション）
            </label>
            <FlavorSelector
              flavors={flavors}
              selectedFlavorId={currentSlide.flavorId}
              onSelect={handleFlavorChange}
              disabled={disabled}
            />
          </div>

          {/* テキスト入力 */}
          <div>
            <label
              htmlFor={`edit-text-${currentIndex}`}
              className={clsx(["mb-2", "block", "text-sm", "font-medium", "text-gray-700"])}
            >
              説明（オプション、100文字まで）
            </label>
            <textarea
              id={`edit-text-${currentIndex}`}
              value={currentSlide.text}
              onChange={handleTextChange}
              disabled={disabled}
              rows={4}
              maxLength={100}
              placeholder="この画像の説明を入力..."
              className={clsx([
                "w-full",
                "rounded-md",
                "border",
                "border-gray-300",
                "p-3",
                "text-sm",
                "focus:border-blue-500",
                "focus:ring-1",
                "focus:ring-blue-500",
                "disabled:cursor-not-allowed",
                "disabled:bg-gray-100",
              ])}
            />
            <p className={clsx(["mt-1", "text-right", "text-xs", "text-gray-500"])}>
              {currentSlide.text.length} / 100文字
            </p>
          </div>
        </div>
      </div>

      {/* フッター（送信ボタン） */}
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
            "bg-blue-600",
            "hover:bg-blue-700",
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
