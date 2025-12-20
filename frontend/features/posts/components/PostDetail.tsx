"use client";

import Image from "next/image";
import { useState } from "react";
import { useGetPostsId, usePostPostsIdLike } from "../../../api/posts";

interface PostDetailProps {
  postId: number;
}

export function PostDetail({ postId }: PostDetailProps) {
  const { data: post, isLoading, isError, refetch } = useGetPostsId(postId);
  const likeMutation = usePostPostsIdLike();

  const slides = post?.slides || [];
  const [current, setCurrent] = useState(0);
  const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);

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
    // optimistic
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
                src={
                  currentSlide.image_url ||
                  "https://placehold.co/400x600/CCCCCC/666666?text=No+Image"
                }
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
                  ◀
                </button>
                <button
                  aria-label="次のスライド"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        </div>

        <div className="md:w-96">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post.user?.icon_url || "https://placehold.co/40x40/CCCCCC/666666?text=U"}
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
            <span
              className="inline-block mb-4 px-2 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: currentSlide.flavor.color || "#6b7280" }}
            >
              {currentSlide.flavor.name}
            </span>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleLike} className="px-3 py-2 bg-white border rounded">
              いいね {displayLikes}
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
