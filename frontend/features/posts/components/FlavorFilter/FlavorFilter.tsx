"use client";

import clsx from "clsx";
import type { Flavor } from "@/types/domain";

interface FlavorFilterProps {
  flavors: Flavor[];
  selectedFlavorIds: number[];
  onFlavorToggle: (flavorId: number) => void;
}

/**
 * FlavorFilterコンポーネント
 * フレーバーをタグ形式で表示し、チェックボックスで絞り込みできる
 * - 色付きラベル表示でフレーバーを視覚的に識別
 * - 複数選択可能
 * - モバイルフレンドリーなタップUI
 */
export function FlavorFilter({ flavors, selectedFlavorIds, onFlavorToggle }: FlavorFilterProps) {
  if (flavors.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">フレーバーで絞り込み</h2>
      <div className="flex flex-wrap gap-2">
        {flavors.map((flavor) => {
          const isSelected = selectedFlavorIds.includes(flavor.id ?? 0);
          return (
            <label
              key={flavor.id}
              className={clsx([
                "flex",
                "cursor-pointer",
                "items-center",
                "gap-1.5",
                "rounded-full",
                "px-3",
                "py-1.5",
                "text-sm",
                "font-medium",
                "transition-all",
                "border-2",
                "select-none",
                isSelected
                  ? "border-gray-800 shadow-md"
                  : "border-transparent hover:border-gray-300",
              ])}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onFlavorToggle(flavor.id ?? 0)}
                className="sr-only"
                aria-label={`${flavor.name}で絞り込む`}
              />
              <span
                className={clsx([
                  "inline-block",
                  "h-3",
                  "w-3",
                  "rounded-full",
                  "ring-1",
                  "ring-white",
                  flavor.color ?? "bg-gray-400",
                ])}
                aria-hidden="true"
              />
              <span className="text-gray-800">{flavor.name}</span>
            </label>
          );
        })}
        {selectedFlavorIds.length > 0 && (
          <button
            type="button"
            onClick={() => {
              // 選択済みのフレーバーをすべてトグルして解除する
              selectedFlavorIds.forEach((id) => onFlavorToggle(id));
            }}
            className={clsx([
              "flex",
              "items-center",
              "gap-1.5",
              "rounded-full",
              "px-3",
              "py-1.5",
              "text-sm",
              "font-medium",
              "transition-all",
              "border",
              "bg-gray-100",
              "border-gray-200",
              "shadow-sm",
              "hover:bg-gray-50",
              "hover:border-gray-300",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-indigo-200",
            ])}
            aria-label="選択をクリア"
          >
            <span
              className={clsx([
                "inline-block",
                "h-3",
                "w-3",
                "rounded-full",
                "ring-1",
                "ring-white",
                "flex",
                "items-center",
                "justify-center",
              ])}
              aria-hidden="true"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-gray-700"
              >
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-gray-800">クリア</span>
          </button>
        )}
      </div>
    </div>
  );
}
