"use client";

import { useMemo, useState } from "react";
import type {
  GoShishaBackendInternalModelsFlavor,
  GoShishaBackendInternalModelsPost,
} from "../../../api/model";
import { useGetPosts } from "../../../api/posts";
import { Timeline } from "./Timeline";

interface TimelineContainerProps {
  initialPosts?: GoShishaBackendInternalModelsPost[];
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
      enabled: !initialPosts, // initialPostsがある場合はfetchしない
    },
  });

  const posts = useMemo(() => initialPosts ?? data?.posts ?? [], [initialPosts, data?.posts]);

  // 投稿から一意のフレーバー一覧を抽出
  const availableFlavors = useMemo(() => {
    const flavorMap = new Map<number, GoShishaBackendInternalModelsFlavor>();
    posts.forEach((post) => {
      if (post.flavor && post.flavor.id) {
        flavorMap.set(post.flavor.id, post.flavor);
      }
    });
    return Array.from(flavorMap.values());
  }, [posts]);

  // フレーバーで絞り込んだ投稿
  const filteredPosts = useMemo(() => {
    if (selectedFlavorIds.length === 0) {
      return posts;
    }
    return posts.filter((post) => post.flavor_id && selectedFlavorIds.includes(post.flavor_id));
  }, [posts, selectedFlavorIds]);

  /**
   * フレーバー選択切り替え
   */
  const handleFlavorToggle = (flavorId: number) => {
    setSelectedFlavorIds((prev) =>
      prev.includes(flavorId) ? prev.filter((id) => id !== flavorId) : [...prev, flavorId]
    );
  };

  return (
    <Timeline
      posts={filteredPosts}
      isLoading={!initialPosts && isLoading}
      error={error}
      availableFlavors={availableFlavors}
      selectedFlavorIds={selectedFlavorIds}
      onFlavorToggle={handleFlavorToggle}
    />
  );
}
