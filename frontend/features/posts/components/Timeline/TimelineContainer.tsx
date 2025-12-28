"use client";

import { useMemo, useState } from "react";
import { useGetPosts } from "@/api/posts";
import { useLike } from "@/features/posts/hooks/useLike";
import type { Flavor, Post } from "@/types/domain";
import { Timeline } from "./Timeline";

interface TimelineContainerProps {
  initialPosts?: Post[];
}

/**
 * TimelineContainerコンポーネント
 * データ取得、フィルタリング、Timeline表示を統合するコンテナコンポーネント
 * - RSCから initialPosts を受け取った場合はそれを使用（SSR最適化）
 * - initialPosts がない場合は useGetPosts でクライアント取得
 * - フレーバーによる絞り込み機能を提供
 */
export function TimelineContainer({ initialPosts }: TimelineContainerProps) {
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<number[]>([]);

  const { data, isLoading, error } = useGetPosts({
    query: {
      enabled: true, // 常に有効にしてポーリングを許可
      initialData: initialPosts ? { posts: initialPosts } : undefined, // 初期データを設定
      refetchInterval: 60000, // 60秒ごとに自動更新
    },
  });

  const posts = useMemo(() => initialPosts ?? data?.posts ?? [], [initialPosts, data?.posts]);

  // 投稿から一意のフレーバー一覧を抽出
  const availableFlavors = useMemo(() => {
    const flavorMap = new Map<number, Flavor>();
    posts.forEach((post) => {
      post.slides?.forEach((slide) => {
        if (slide.flavor && slide.flavor.id) {
          flavorMap.set(slide.flavor.id, slide.flavor);
        }
      });
    });
    return Array.from(flavorMap.values());
  }, [posts]);

  // フレーバーで絞り込んだ投稿
  const filteredPosts = useMemo(() => {
    if (selectedFlavorIds.length === 0) {
      return posts;
    }
    return posts.filter((post) => {
      return post.slides?.some(
        (slide) => slide.flavor?.id && selectedFlavorIds.includes(slide.flavor.id)
      );
    });
  }, [posts, selectedFlavorIds]);

  /**
   * フレーバー選択切り替え
   */
  const handleFlavorToggle = (flavorId: number) => {
    setSelectedFlavorIds((prev) =>
      prev.includes(flavorId) ? prev.filter((id) => id !== flavorId) : [...prev, flavorId]
    );
  };

  const { onLike, onUnlike } = useLike();

  return (
    <Timeline
      posts={filteredPosts}
      isLoading={!initialPosts && isLoading}
      error={error}
      availableFlavors={availableFlavors}
      selectedFlavorIds={selectedFlavorIds}
      onFlavorToggle={handleFlavorToggle}
      onLike={onLike}
      onUnlike={onUnlike}
    />
  );
}
