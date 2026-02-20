"use client";

import { clsx } from "clsx";
import { FlavorLabel } from "@/components/FlavorLabel";
import type { Flavor } from "@/types/domain";

interface Slide {
  text?: string | null;
  flavor?: Flavor;
}

interface Props {
  currentSlide?: Slide | undefined;
  optimisticLikes: number;
  isLiked: boolean;
  onLike: () => void;
}

export function PostDetailFooter({ currentSlide, optimisticLikes, isLiked, onLike }: Props) {
  return (
    <div className={clsx(["md:w-96"])}>
      <p className={clsx(["mb-4", "whitespace-pre-wrap"])}>{currentSlide?.text}</p>

      {currentSlide?.flavor && (
        <div className={clsx(["mb-4"])}>
          <FlavorLabel flavor={currentSlide.flavor} />
        </div>
      )}

      <div className={clsx(["flex", "items-center", "gap-3", "mt-4"])}>
        <button
          onClick={onLike}
          aria-pressed={isLiked}
          className={clsx([
            "inline-flex",
            "items-center",
            "gap-2",
            "px-3",
            "py-2",
            "border",
            "rounded",
            "transition-transform",
            "transform",
            "active:scale-95",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-offset-1",
            "bg-white",
            ...(isLiked ? ["text-red-500"] : ["text-gray-700"]),
          ])}
        >
          {isLiked ? (
            <svg
              className={clsx(["w-4", "h-4"])}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg
              className={clsx(["w-4", "h-4"])}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
          <span className={clsx(["text-sm"])}>{optimisticLikes}</span>
        </button>
        <button
          onClick={async () => {
            try {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(window.location.href);
                alert("URLをコピーしました");
              }
            } catch (error) {
              // クリップボードAPIが使用できない場合は何もしない
              console.debug("クリップボードへのコピーに失敗しました", error);
            }
          }}
          aria-label="シェア"
          className={clsx([
            "inline-flex",
            "items-center",
            "gap-2",
            "px-3",
            "py-2",
            "border",
            "rounded",
            "transition-transform",
            "transform",
            "active:scale-95",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-offset-1",
            "text-gray-700",
            "bg-white",
          ])}
        >
          <svg
            className={clsx(["w-4", "h-4"])}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 6l-4-4-4 4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v13" />
          </svg>
          <span className={clsx(["text-sm"])}>シェア</span>
        </button>
      </div>
    </div>
  );
}

export default PostDetailFooter;
