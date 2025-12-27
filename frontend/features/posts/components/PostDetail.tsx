"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import type { GoShishaBackendInternalModelsPost } from "@/api/model";
import { useGetPostsId } from "@/api/posts";
import { Avatar } from "@/components/Avatar";
import { FlavorLabel } from "@/components/FlavorLabel";
import { NextIcon, PrevIcon } from "@/components/icons/";
import { useLike } from "@/features/posts/hooks/useLike";
import { getImageUrl } from "@/lib/getImageUrl";

interface PostDetailProps {
  postId: number;
  initialPost?: GoShishaBackendInternalModelsPost;
}

export function PostDetail({ postId, initialPost }: PostDetailProps) {
  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = useGetPostsId(postId, {
    query: { initialData: initialPost },
  });

  const slides = post?.slides || [];
  const [current, setCurrent] = useState(0);
  const [optimisticLikes, setOptimisticLikes] = useState<number>(
    initialPost?.likes ?? post?.likes ?? 0
  );
  const [isLiked, setIsLiked] = useState<boolean>(initialPost?.is_liked ?? post?.is_liked ?? false);

  const { onLike, onUnlike } = useLike();

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-80 bg-gray-200 rounded-lg mb-4" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-2">投稿を取得できませんでした。</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => refetch()}>
          再試行
        </button>
      </div>
    );
  }

  const handlePrev = () => setCurrent((c) => (c - 1 + slides.length) % Math.max(1, slides.length));
  const handleNext = () => setCurrent((c) => (c + 1) % Math.max(1, slides.length));

  // 共通の戻るハンドラ: 履歴があれば戻る、なければトップへ
  const handleBack = () => {
    if (typeof window === "undefined") return;
    if (window.history?.length && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  const handleLike = () => {
    if (!post.id) return;
    if (isLiked) {
      setIsLiked(false);
      setOptimisticLikes((prev) => Math.max(0, (prev ?? post.likes ?? 0) - 1));
      onUnlike(post.id);
      return;
    }

    // like
    setIsLiked(true);
    setOptimisticLikes((prev) => (prev ?? post.likes ?? 0) + 1);
    onLike(post.id);
  };

  const currentSlide = slides.length > 0 ? slides[current] : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:flex-1">
          <div className="relative w-full md:w-80 aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
            <div className="absolute left-2 top-2 z-30 md:hidden flex items-center gap-2 bg-black/40 text-white px-3 py-2 rounded-md backdrop-blur-sm pointer-events-auto">
              <button
                type="button"
                aria-label="戻る"
                onClick={handleBack}
                className="inline-flex items-center gap-2 p-1 rounded focus:outline-none"
              >
                <PrevIcon />
                <span className="text-sm">戻る</span>
              </button>
            </div>

            {currentSlide ? (
              <Image
                src={getImageUrl(currentSlide.image_url)}
                alt={currentSlide.text || post.message || "投稿画像"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            {slides.length > 1 && (
              <>
                <button
                  aria-label="前のスライド"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full"
                >
                  <PrevIcon />
                </button>
                <button
                  aria-label="次のスライド"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full"
                >
                  <NextIcon />
                </button>
                {/* ドットページネーション（画像上に重ねる） */}
                <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`スライド ${i + 1}`}
                      aria-current={i === current}
                      onClick={() => setCurrent(i)}
                      className={
                        i === current
                          ? "w-3 h-3 rounded-full bg-white"
                          : "w-2 h-2 rounded-full bg-white/50"
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="md:w-96">
          <div className="hidden md:flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="戻る"
              className="inline-flex items-center gap-2 text-sm text-gray-700 focus:outline-none"
            >
              <PrevIcon className="w-4 h-4 text-black" />
              <span>戻る</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={post.user?.icon_url ?? null}
              alt={post.user?.display_name || "ユーザー"}
              size={40}
            />
            <div>
              <div className="font-medium">{post.user?.display_name || "匿名"}</div>
              <div className="text-sm text-gray-500">
                <time dateTime={post.created_at ?? undefined}>{post.created_at ?? ""}</time>
              </div>
            </div>
          </div>

          <p className="mb-4 whitespace-pre-wrap">{currentSlide?.text || post.message}</p>

          {currentSlide?.flavor && (
            <div className="mb-4">
              <FlavorLabel flavor={currentSlide.flavor} />
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleLike}
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
              className={clsx(
                "inline-flex items-center gap-2 px-3 py-2 border rounded transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1",
                "text-gray-700 bg-white"
              )}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 6l-4-4-4 4"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v13" />
              </svg>
              <span className="text-sm">シェア</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
