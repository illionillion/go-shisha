"use client";

import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { PostCard } from "./PostCard";

interface TimelineProps {
  posts: GoShishaBackendInternalModelsPost[];
  isLoading?: boolean;
  error?: unknown;
  onPostClick?: (post: GoShishaBackendInternalModelsPost) => void;
}

/**
 * Timelineコンポーネント
 * REQUIREMENTS.mdの仕様に基づいた投稿タイムライン
 * - 2列グリッドレイアウト
 * - ローディング・エラーハンドリング
 */
export function Timeline({ posts, isLoading = false, error = null, onPostClick }: TimelineProps) {
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="grid grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} onClick={handlePostClick} />
        ))}
      </div>
    </div>
  );
}
