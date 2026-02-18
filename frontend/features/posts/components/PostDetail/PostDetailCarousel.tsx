"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { NextIcon, PrevIcon } from "@/components/icons/";
import { getImageUrl } from "@/lib/getImageUrl";
import type { Flavor } from "@/types/domain";

interface Slide {
  image_url?: string;
  text?: string;
  flavor?: Flavor;
}

interface Props {
  slides: Slide[];
  current: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (i: number) => void;
  handleBack: () => void;
}

export function PostDetailCarousel({
  slides,
  current,
  onPrev,
  onNext,
  onDotClick,
  handleBack,
}: Props) {
  const currentSlide = slides.length > 0 ? slides[current] : undefined;

  return (
    <div className={clsx(["md:flex-1"])}>
      <div
        className={clsx([
          "relative",
          "w-full",
          "md:w-80",
          "aspect-[2/3]",
          "rounded-lg",
          "overflow-hidden",
          "bg-gray-100",
        ])}
      >
        <div
          className={clsx([
            "absolute",
            "left-2",
            "top-2",
            "z-30",
            "md:hidden",
            "flex",
            "items-center",
            "gap-2",
            "bg-black/40",
            "text-white",
            "px-3",
            "py-2",
            "rounded-md",
            "backdrop-blur-sm",
            "pointer-events-auto",
          ])}
        >
          <button
            type="button"
            aria-label="戻る"
            onClick={handleBack}
            className={clsx([
              "inline-flex",
              "items-center",
              "gap-2",
              "p-1",
              "rounded",
              "focus:outline-none",
            ])}
          >
            <PrevIcon />
            <span className={clsx(["text-sm"])}>戻る</span>
          </button>
        </div>

        {currentSlide ? (
          <Image
            src={getImageUrl(currentSlide.image_url)}
            alt={currentSlide.text || "投稿画像"}
            fill
            className={clsx(["object-cover"])}
          />
        ) : (
          <div
            className={clsx([
              "w-full",
              "h-full",
              "flex",
              "items-center",
              "justify-center",
              "text-gray-500",
            ])}
          >
            No Image
          </div>
        )}

        {slides.length > 1 && (
          <>
            <button
              aria-label="前のスライド"
              onClick={onPrev}
              className={clsx([
                "absolute",
                "left-2",
                "top-1/2",
                "-translate-y-1/2",
                "p-2",
                "bg-white/20",
                "rounded-full",
              ])}
            >
              <PrevIcon />
            </button>
            <button
              aria-label="次のスライド"
              onClick={onNext}
              className={clsx([
                "absolute",
                "right-2",
                "top-1/2",
                "-translate-y-1/2",
                "p-2",
                "bg-white/20",
                "rounded-full",
              ])}
            >
              <NextIcon />
            </button>
            <div
              className={clsx([
                "absolute",
                "left-1/2",
                "bottom-3",
                "-translate-x-1/2",
                "flex",
                "items-center",
                "gap-2",
                "bg-black/30",
                "px-2",
                "py-1",
                "rounded",
              ])}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`スライド ${i + 1}`}
                  aria-current={i === current}
                  onClick={() => onDotClick(i)}
                  className={clsx([
                    i === current
                      ? "w-3 h-3 rounded-full bg-white"
                      : "w-2 h-2 rounded-full bg-white/50",
                  ])}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PostDetailCarousel;
