"use client";

import { clsx } from "clsx";
import { toast } from "sonner";
import { FlavorLabel } from "@/components/FlavorLabel";
import { HeartIcon, ShareIcon } from "@/components/icons";
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
          <HeartIcon isFilled={isLiked} />
          <span className={clsx(["text-sm"])}>{optimisticLikes}</span>
        </button>
        <button
          onClick={async () => {
            try {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("URLをコピーしました");
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
          <ShareIcon />
          <span className={clsx(["text-sm"])}>シェア</span>
        </button>
      </div>
    </div>
  );
}

export default PostDetailFooter;
