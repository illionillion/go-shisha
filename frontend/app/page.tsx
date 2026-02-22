import { isSuccessResponse } from "@/lib/api-helpers";
import type { Post } from "@/types/domain";
import { getPosts } from "../api/posts";
import { PostCreateContainer } from "../features/posts/components/PostCreateContainer";
import { TimelineContainer } from "../features/posts/components/Timeline/TimelineContainer";

/**
 * ホームページ（トップページ）
 * REQUIREMENTS.mdのホーム（タイムライン）仕様を実装
 * RSCで事前に投稿データを取得してSSR最適化
 */
export default async function Home() {
  // RSCでサーバーサイド取得（SSR）
  let initialPosts: Post[] | undefined;
  try {
    const response = await getPosts();
    // apiFetchがエラー時にthrowするためresponseは常に成功レスポンスだが、
    // TypeScriptの型推論のためにisSuccessResponseで明示的に絞り込む
    if (isSuccessResponse(response)) {
      initialPosts = response.data.posts;
    }
  } catch (error) {
    console.error("Failed to fetch posts in RSC:", error);
    // エラー時はクライアント側でフォールバック
  }

  return (
    <main className="min-h-screen">
      <TimelineContainer initialPosts={initialPosts} />
      <PostCreateContainer />
    </main>
  );
}
