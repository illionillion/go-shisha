"use client";

import { useGetPosts } from "../../../api/posts";
import { Timeline } from "./Timeline";

/**
 * TimelineContainerコンポーネント
 * データ取得とTimeline表示を統合するコンテナコンポーネント
 */
export function TimelineContainer() {
  const { data, isLoading, error } = useGetPosts();

  return <Timeline posts={data?.posts || []} isLoading={isLoading} error={error} />;
}
