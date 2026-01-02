"use client";

import clsx from "clsx";
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
    <div className="md:w-96">
      <p className="mb-4 whitespace-pre-wrap">{currentSlide?.text}</p>

      {currentSlide?.flavor && (
        <div className="mb-4">
          <FlavorLabel flavor={currentSlide.flavor} />
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={onLike}
          aria-pressed={isLiked}
          className={clsx(
            "inline-flex items-center gap-2 px-3 py-2 border rounded transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1",
            isLiked ? "text-red-500 bg-white" : "text-gray-700 bg-white"
          )}
        >
          {isLiked ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
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
          <span className="text-sm">{optimisticLikes}</span>
        </button>
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href);
            alert("URLをコピーしました");
          }}
          aria-label="シェア"
          className="inline-flex items-center gap-2 px-3 py-2 border rounded transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 text-gray-700 bg-white"
        >
          <svg
            className="w-4 h-4"
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
          <span className="text-sm">シェア</span>
        </button>
      </div>
    </div>
  );
}

export default PostDetailFooter;
