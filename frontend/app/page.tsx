import type { GoShishaBackendInternalModelsPost } from "../api/model";
import { getPosts } from "../api/posts";
import { TimelineContainer } from "../features/posts/components/TimelineContainer";

/**
 * ホームページ（トップページ）
 * REQUIREMENTS.mdのホーム（タイムライン）仕様を実装
 * RSCで事前に投稿データを取得してSSR最適化
 */
export default async function Home() {
  // RSCでサーバーサイド取得（SSR）
  let initialPosts: GoShishaBackendInternalModelsPost[] | undefined;
  try {
    const data = await getPosts();
    initialPosts = data.posts;
  } catch (error) {
    console.error("Failed to fetch posts in RSC:", error);
    // エラー時はクライアント側でフォールバック
  }

  return (
    <main className="min-h-screen">
      <TimelineContainer initialPosts={initialPosts} />
    </main>
  );
}
