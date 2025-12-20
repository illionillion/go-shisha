"use client";

import { useEffect, useState } from "react";
import type {
  GoShishaBackendInternalModelsFlavor,
  GoShishaBackendInternalModelsPost,
} from "../../../api/model";
import { FlavorFilter } from "./FlavorFilter";
import { PostCard } from "./PostCard";

export interface TimelineProps {
  posts: GoShishaBackendInternalModelsPost[];
  isLoading?: boolean;
  error?: unknown;
  availableFlavors?: GoShishaBackendInternalModelsFlavor[];
  selectedFlavorIds?: number[];
  onFlavorToggle?: (flavorId: number) => void;
  onPostClick?: (post: GoShishaBackendInternalModelsPost) => void;
}

/**
 * Timelineコンポーネント
 * REQUIREMENTS.mdの仕様に基づいた投稿タイムライン
 * - 2列グリッドレイアウト
 * - フレーバーフィルター（オプション）
 * - ローディング・エラーハンドリング
 */
export function Timeline({
  posts,
  isLoading = false,
  error = null,
  availableFlavors = [],
  selectedFlavorIds = [],
  onFlavorToggle,
  onPostClick,
}: TimelineProps) {
  const [tick, setTick] = useState(0);
  const autoPlayInterval = 3000; // 3秒ごとに統一

  useEffect(() => {
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed >= autoPlayInterval) {
        setTick((prev) => prev + 1);
        start = timestamp; // タイマーをリセット
      }

      requestAnimationFrame(step);
    };

    const animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [autoPlayInterval]);

  const handleLike = (postId: number) => {
    // TODO: いいねAPI連携
    console.log("Liked post:", postId);
  };

  const handlePostClick = (post: GoShishaBackendInternalModelsPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      // TODO: 投稿詳細ページ遷移
      console.log("Clicked post:", post.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">エラーが発生しました</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="text-center text-gray-500">投稿がありません</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {availableFlavors.length > 0 && onFlavorToggle && (
        <FlavorFilter
          flavors={availableFlavors}
          selectedFlavorIds={selectedFlavorIds}
          onFlavorToggle={onFlavorToggle}
        />
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            tick={tick}
            autoPlayInterval={autoPlayInterval}
            onLike={handleLike}
            onClick={handlePostClick}
          />
        ))}
      </div>
    </div>
  );
}
