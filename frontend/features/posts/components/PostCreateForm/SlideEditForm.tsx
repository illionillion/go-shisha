"use client";
import { clsx } from "clsx";
import { useCallback } from "react";
import type { EditableSlide, Flavor } from "@/types/domain";
import { FlavorSelector } from "../FlavorSelector";

export type SlideEditFormProps = {
  /** 編集対象のスライド */
  slide: EditableSlide;
  /** 現在のインデックス（1-based） */
  currentIndex: number;
  /** 総スライド数 */
  totalCount: number;
  /** フレーバー一覧 */
  flavors: Flavor[];
  /** スライド更新時のコールバック */
  onUpdate: (slide: EditableSlide) => void;
  /** 前のスライドへ移動 */
  onPrevious?: () => void;
  /** 次のスライドへ移動 */
  onNext?: () => void;
  /** 無効化状態 */
  disabled?: boolean;
};

/**
 * スライド編集フォーム
 *
 * 1枚の画像に対してフレーバー・説明を入力するUI
 * カルーセル形式で前後移動可能
 */
export function SlideEditForm({
  slide,
  currentIndex,
  totalCount,
  flavors,
  onUpdate,
  onPrevious,
  onNext,
  disabled = false,
}: SlideEditFormProps) {
  const handleFlavorChange = useCallback(
    (flavorId: number | undefined) => {
      onUpdate({ ...slide, flavorId });
    },
    [slide, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const description = e.target.value;
      if (description.length <= 100) {
        onUpdate({ ...slide, description });
      }
    },
    [slide, onUpdate]
  );

  return (
    <div className={clsx(["flex", "flex-col", "gap-6"])}>
      {/* ヘッダー */}
      <div className={clsx(["flex", "items-center", "justify-between"])}>
        <h3 className={clsx(["text-lg", "font-semibold"])}>
          画像 {currentIndex} / {totalCount}
        </h3>
        <div className={clsx(["flex", "gap-2"])}>
          <button
            type="button"
            onClick={onPrevious}
            disabled={disabled || currentIndex === 1}
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
            ])}
          >
            ← 前
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled || currentIndex === totalCount}
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
            ])}
          >
            次 →
          </button>
        </div>
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
        <img
          src={slide.previewUrl}
          alt={`プレビュー ${currentIndex}`}
          className={clsx(["h-full", "w-full", "object-contain"])}
        />
      </div>

      {/* ファイル情報 */}
      <div className={clsx(["text-sm", "text-gray-600"])}>
        <p className={clsx(["truncate"])}>ファイル名: {slide.file.name}</p>
        <p>サイズ: {(slide.file.size / (1024 * 1024)).toFixed(2)} MB</p>
      </div>

      {/* フレーバー選択 */}
      <div>
        <label className={clsx(["mb-2", "block", "text-sm", "font-medium", "text-gray-700"])}>
          フレーバー（オプション）
        </label>
        <FlavorSelector
          flavors={flavors}
          selectedFlavorId={slide.flavorId}
          onSelect={handleFlavorChange}
          disabled={disabled}
        />
      </div>

      {/* 説明入力 */}
      <div>
        <label
          htmlFor={`description-${currentIndex}`}
          className={clsx(["mb-2", "block", "text-sm", "font-medium", "text-gray-700"])}
        >
          説明（オプション、100文字まで）
        </label>
        <textarea
          id={`description-${currentIndex}`}
          value={slide.description}
          onChange={handleDescriptionChange}
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
          {slide.description.length} / 100文字
        </p>
      </div>
    </div>
  );
}
