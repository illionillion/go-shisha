"use client";

import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetPostsId } from "@/api/posts";
import { useLike } from "@/features/posts/hooks/useLike";
import { isSuccessResponse } from "@/lib/api-helpers";
import type { Post } from "@/types/domain";
import PostDetailCarousel from "./PostDetailCarousel";
import PostDetailFooter from "./PostDetailFooter";
import PostDetailHeader from "./PostDetailHeader";

interface PostDetailProps {
  postId: number;
  initialPost?: Post;
}

export function PostDetail({ postId, initialPost }: PostDetailProps) {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetPostsId(postId, {
    query: {
      initialData: initialPost
        ? { data: initialPost, status: 200, headers: new Headers() }
        : undefined,
    },
  });
  const router = useRouter();

  // Orval 8.x: レスポンスから成功時のデータを取り出す
  // apiFetchがエラー時にthrowするためresponseは常に成功レスポンスだが、
  // TypeScriptの型推論のためにisSuccessResponseで明示的に絞り込む必要がある
  const post = response && isSuccessResponse(response) ? response.data : initialPost;

  const slides = post?.slides || [];
  const [current, setCurrent] = useState(0);
  const [optimisticLikes, setOptimisticLikes] = useState<number>(
    initialPost?.likes ?? post?.likes ?? 0
  );
  const [isLiked, setIsLiked] = useState<boolean>(initialPost?.is_liked ?? post?.is_liked ?? false);

  const { onLike, onUnlike } = useLike();

  if (isLoading) {
    return (
      <div className={clsx(["p-4"])}>
        <div className={clsx(["h-80", "bg-gray-200", "rounded-lg", "mb-4"])} />
        <div className={clsx(["h-6", "bg-gray-200", "rounded", "w-3/4", "mb-2"])} />
        <div className={clsx(["h-4", "bg-gray-200", "rounded", "w-1/2"])} />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className={clsx(["p-4", "text-center"])}>
        <p className={clsx(["text-red-600", "mb-2"])}>投稿を取得できませんでした。</p>
        <button className={clsx(["px-4", "py-2", "bg-blue-500", "text-white", "rounded"])} onClick={() => refetch()}>
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
      router.push("/");
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
    <div className={clsx(["mx-auto", "max-w-3xl", "px-4", "py-6"])}>
      <div className={clsx(["flex", "flex-col", "md:flex-row", "gap-6"])}>
        <PostDetailCarousel
          slides={slides}
          current={current}
          onPrev={handlePrev}
          onNext={handleNext}
          onDotClick={(i) => setCurrent(i)}
          handleBack={handleBack}
        />

        <div>
          <PostDetailHeader user={post.user} createdAt={post.created_at} onBack={handleBack} />

          <PostDetailFooter
            currentSlide={currentSlide}
            optimisticLikes={optimisticLikes}
            isLiked={isLiked}
            onLike={handleLike}
          />
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
