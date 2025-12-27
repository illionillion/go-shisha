"use client";

import Link from "next/link";
import type {
  GoShishaBackendInternalModelsFlavor,
  GoShishaBackendInternalModelsPost,
} from "../../../../api/model";
import { FlavorFilter } from "../FlavorFilter/FlavorFilter";
import { PostCard } from "../PostCard";

export interface TimelineProps {
  posts: GoShishaBackendInternalModelsPost[];
  isLoading?: boolean;
  error?: unknown;
  availableFlavors?: GoShishaBackendInternalModelsFlavor[];
  selectedFlavorIds?: number[];
  onFlavorToggle?: (flavorId: number) => void;
  onLike?: (postId: number) => void;
  onUnlike?: (postId: number) => void;
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
  onLike,
  onUnlike,
}: TimelineProps) {
  const handleLike = (postId: number) => {
    if (onLike) return onLike(postId);
    // fallback: basic log
    console.log("Liked post:", postId);
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
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block"
            aria-label={`View post ${post.id}`}
          >
            <PostCard post={post} onLike={handleLike} onUnlike={onUnlike} />
          </Link>
        ))}
      </div>
    </div>
  );
}
