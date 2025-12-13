"use client";

import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { useGetPosts } from "../../../api/posts";
import { Timeline } from "./Timeline";

interface TimelineContainerProps {
  initialPosts?: GoShishaBackendInternalModelsPost[];
}

/**
 * TimelineContainerコンポーネント
 * データ取得とTimeline表示を統合するコンテナコンポーネント
 * - RSCから initialPosts を受け取った場合はそれを使用（SSR最適化）
 * - initialPosts がない場合は useGetPosts でクライアント取得
 */
export function TimelineContainer({ initialPosts }: TimelineContainerProps) {
  const { data, isLoading, error } = useGetPosts({
    query: {
      enabled: !initialPosts, // initialPostsがある場合はfetchしない
    },
  });

  const posts = initialPosts || data?.posts || [];

  return <Timeline posts={posts} isLoading={!initialPosts && isLoading} error={error} />;
}
