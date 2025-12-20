"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { GoShishaBackendInternalModelsPost } from "@/api/model";
import { useGetPostsId, usePostPostsIdLike } from "@/api/posts";
import { FlavorLabel } from "@/components/FlavorLabel";
import { NextIcon, PrevIcon } from "@/components/icons/";
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
  const likeMutation = usePostPostsIdLike();

  const slides = post?.slides || [];
  const [current, setCurrent] = useState(0);
  const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (post) {
      setIsLiked(post.is_liked ?? false);
    }
  }, [post]);

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

  const displayLikes = optimisticLikes ?? post.likes ?? 0;

  const handlePrev = () => setCurrent((c) => (c - 1 + slides.length) % Math.max(1, slides.length));
  const handleNext = () => setCurrent((c) => (c + 1) % Math.max(1, slides.length));

  const handleLike = () => {
    if (!post.id) return;
    if (isLiked) {
      setIsLiked(false);
      setOptimisticLikes((prev) => Math.max(0, (prev ?? post.likes ?? 0) - 1));
      return;
    }

    // like
    setIsLiked(true);
    setOptimisticLikes((prev) => (prev ?? post.likes ?? 0) + 1);
    likeMutation.mutate({ id: post.id }, { onError: () => refetch() });
  };

  const currentSlide = slides.length > 0 ? slides[current] : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:flex-1">
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
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
              </>
            )}
          </div>
        </div>

        <div className="md:w-96">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={getImageUrl(post.user?.icon_url)}
              alt={post.user?.display_name || "ユーザー"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-medium">{post.user?.display_name || "匿名"}</div>
              <div className="text-sm text-gray-500">
                {new Date(post.created_at || Date.now()).toLocaleString()}
              </div>
            </div>
          </div>

          <p className="mb-4 whitespace-pre-wrap">{currentSlide?.text || post.message}</p>

          {currentSlide?.flavor && (
            <div className="mb-4">
              <FlavorLabel flavor={currentSlide.flavor} />
            </div>
          )}

          {/* ドットページネーション */}
          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`スライド ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={
                    i === current
                      ? "w-3 h-3 rounded-full bg-white"
                      : "w-2 h-2 rounded-full bg-white/50"
                  }
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleLike}
              className="px-3 py-2 bg-white border rounded"
              aria-pressed={isLiked}
            >
              {isLiked ? "いいね済み" : "いいね"} {displayLikes}
            </button>
            <button
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href);
                alert("URLをコピーしました");
              }}
              className="px-3 py-2 bg-white border rounded"
            >
              シェア
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
