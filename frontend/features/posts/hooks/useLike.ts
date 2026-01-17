import { useQueryClient } from "@tanstack/react-query";
import {
  usePostPostsIdLike,
  usePostPostsIdUnlike,
  getGetPostsIdQueryKey,
  getGetPostsQueryKey,
} from "@/api/posts";
import type { Post } from "@/types/domain";

/**
 * リスト内の該当投稿のいいね数を楽観的に更新
 */
function updatePostInList(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  updater: (post: Post) => Post
) {
  // 全投稿リストを更新
  const postsKey = getGetPostsQueryKey();
  queryClient.setQueryData<{ posts: Post[] }>(postsKey, (old) => {
    if (!old?.posts) return old;
    return {
      ...old,
      posts: old.posts.map((post) => (post.id === postId ? updater(post) : post)),
    };
  });

  // ユーザー別投稿リストも更新（存在する場合）
  // Orval が生成するキー等、実装差に依存せず、
  // クエリキーに `users` と `posts` を含むキャッシュを探して更新します。
  // パフォーマンスを考慮し、usersプレフィックスを持つクエリのみ対象に絞る
  queryClient.getQueriesData<{ posts: Post[] }>({ queryKey: ["users"] }).forEach(([key, data]) => {
    if (!data?.posts) return;
    const keyParts = Array.isArray(key) ? key.map((p) => String(p)) : [String(key)];
    const keyString = keyParts.join("/");

    const looksLikeUserPosts =
      /\/users\/\d+\/posts$/.test(keyString) ||
      (keyString.includes("users") && keyString.includes("posts"));

    if (!looksLikeUserPosts) return;

    queryClient.setQueryData(key, {
      ...data,
      posts: data.posts.map((post) => (post.id === postId ? updater(post) : post)),
    });
  });
}

export function useLike() {
  const queryClient = useQueryClient();
  const likeMut = usePostPostsIdLike();
  const unlikeMut = usePostPostsIdUnlike();

  const onLike = (postId: number) => {
    const detailKey = getGetPostsIdQueryKey(postId);
    const prev = queryClient.getQueryData<Post | undefined>(detailKey);

    // optimistic update: 詳細画面用
    queryClient.setQueryData<Post | undefined>(detailKey, (old) =>
      old ? { ...old, likes: (old.likes ?? 0) + 1, is_liked: true } : old
    );

    // optimistic update: リスト内
    updatePostInList(queryClient, postId, (post) => ({
      ...post,
      likes: (post.likes ?? 0) + 1,
      is_liked: true,
    }));

    likeMut.mutate(
      { id: postId },
      {
        onError: () => {
          if (prev) {
            // 詳細画面のキャッシュをロールバック
            queryClient.setQueryData(detailKey, prev);
            // リスト内のキャッシュもロールバック
            updatePostInList(queryClient, postId, () => prev);
          }
        },
        // onSettledでinvalidateしない（楽観的更新のみで対応）
      }
    );
  };

  const onUnlike = (postId: number) => {
    const detailKey = getGetPostsIdQueryKey(postId);
    const prev = queryClient.getQueryData<Post | undefined>(detailKey);

    // optimistic update: 詳細画面用
    queryClient.setQueryData<Post | undefined>(detailKey, (old) =>
      old ? { ...old, likes: Math.max(0, (old.likes ?? 0) - 1), is_liked: false } : old
    );

    // optimistic update: リスト内
    updatePostInList(queryClient, postId, (post) => ({
      ...post,
      likes: Math.max(0, (post.likes ?? 0) - 1),
      is_liked: false,
    }));

    unlikeMut.mutate(
      { id: postId },
      {
        onError: () => {
          if (prev) {
            // 詳細画面のキャッシュをロールバック
            queryClient.setQueryData(detailKey, prev);
            // リスト内のキャッシュもロールバック
            updatePostInList(queryClient, postId, () => prev);
          }
        },
        // onSettledでinvalidateしない（楽観的更新のみで対応）
      }
    );
  };

  return { onLike, onUnlike };
}
