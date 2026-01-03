"use client";

import { useMemo, useState } from "react";
import { useGetPosts } from "@/api/posts";
import { useGetUsersIdPosts } from "@/api/users";
import { useLike } from "@/features/posts/hooks/useLike";
import type { Flavor, Post } from "@/types/domain";
import { Timeline } from "./Timeline";

interface TimelineContainerProps {
  initialPosts?: Post[];
  /** optional: when provided, load posts for this user */
  userId?: number;
}

/**
 * TimelineContainerコンポーネント
 * データ取得、フィルタリング、Timeline表示を統合するコンテナコンポーネント
 * - RSCから initialPosts を受け取った場合はそれを使用（SSR最適化）
 * - initialPosts がない場合は useGetPosts でクライアント取得
 * - フレーバーによる絞り込み機能を提供
 */
export function TimelineContainer({ initialPosts, userId }: TimelineContainerProps) {
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<number[]>([]);

  // Prepare shared query options
  const queryOptions = {
    enabled: true,
    initialData: initialPosts ? { posts: initialPosts } : undefined,
    refetchInterval: 60000,
  } as const;

  // Call both hooks unconditionally to satisfy hooks rules; control fetching via `enabled`.
  // Do NOT coerce `userId` to 0 when undefined — pass through `undefined` so query key
  // does not change unexpectedly.
  // useGetUsersIdPosts expects a number; pass 0 when undefined but disable fetching
  // via `enabled` to avoid making requests when no userId is provided.
  const usersHook = useGetUsersIdPosts(userId ?? 0, {
    query: {
      ...queryOptions,
      enabled: !!userId,
    },
  });

  const postsHook = useGetPosts({
    query: {
      ...queryOptions,
      enabled: userId == null,
    },
  });

  const data = userId != null ? usersHook.data : postsHook.data;
  const isLoading = userId != null ? usersHook.isLoading : postsHook.isLoading;
  const error = userId != null ? usersHook.error : postsHook.error;

  const posts = useMemo(() => {
    return data?.posts ?? initialPosts ?? [];
  }, [data?.posts, initialPosts]);

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
