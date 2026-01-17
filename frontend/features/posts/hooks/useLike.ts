import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import {
  usePostPostsIdLike,
  usePostPostsIdUnlike,
  getGetPostsIdQueryKey,
  getGetPostsQueryKey,
} from "@/api/posts";
import { getGetUsersIdPostsQueryKey } from "@/api/users";
import type { Post } from "@/types/domain";

/**
 * リスト内の該当投稿のいいね数を楽観的に更新
 */
function updatePostInList(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  updater: (post: Post) => Post
): Array<[QueryKey, { posts: Post[] } | undefined]> {
  const prevs: Array<[QueryKey, { posts: Post[] } | undefined]> = [];

  // 全投稿リストを更新（prev を保存）
  const postsKey = getGetPostsQueryKey();
  const postsPrev = queryClient.getQueryData<{ posts: Post[] }>(postsKey);
  prevs.push([postsKey, postsPrev]);
  queryClient.setQueryData<{ posts: Post[] }>(postsKey, (old) => {
    if (!old?.posts) return old;
    return {
      ...old,
      posts: old.posts.map((post) => (post.id === postId ? updater(post) : post)),
    };
  });

  // ユーザー別投稿リストも更新（存在する場合）
  // getQueriesData の返り値のタプル型を明示して安全に扱う
  queryClient
    .getQueriesData<{ posts: Post[] }>({})
    .forEach(([key, data]: [QueryKey, { posts: Post[] } | undefined]) => {
      if (!data?.posts) return;
      if (!Array.isArray(key) || typeof key[0] !== "string") return;

      const first = String(key[0]);
      if (!first.startsWith("/users/")) return;

      const maybe = /^\/users\/(\d+)\/posts$/.exec(first);
      if (!maybe) return;
      const id = Number(maybe[1]);
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) return;

      const expected = getGetUsersIdPostsQueryKey(id);
      if (JSON.stringify(key) !== JSON.stringify(expected)) return;

      // 保存してから更新
      prevs.push([key, data]);
      queryClient.setQueryData<{ posts: Post[] }>(key, {
        ...data,
        posts: data.posts.map((post) => (post.id === postId ? updater(post) : post)),
      });
    });

  return prevs;
}

// 指定投稿について、リスト内の各クエリキーごとの元データをキャプチャして返す
function captureListPrev(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number
): Array<{ key: QueryKey; prev?: Post }> {
  const listPrev: Array<{ key: QueryKey; prev?: Post }> = [];
  queryClient
    .getQueriesData<{ posts: Post[] }>({})
    .forEach(([key, data]: [QueryKey, { posts: Post[] } | undefined]) => {
      if (!data?.posts) return;
      const found = data.posts.find((p) => p.id === postId);
      if (found) {
        listPrev.push({ key, prev: found });
      }
    });
  return listPrev;
}

export function useLike() {
  const queryClient = useQueryClient();
  const likeMut = usePostPostsIdLike();
  const unlikeMut = usePostPostsIdUnlike();

  const onLike = (postId: number) => {
    const detailKey = getGetPostsIdQueryKey(postId);
    const prev = queryClient.getQueryData<Post | undefined>(detailKey);
    const listPrev = captureListPrev(queryClient, postId);

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
            // リスト内のキャッシュも個別にロールバック
            listPrev.forEach(({ key, prev: p }) => {
              if (!p) return;
              queryClient.setQueryData(key, (data: { posts: Post[] } | undefined) => {
                if (!data?.posts) return data;
                return {
                  ...data,
                  posts: data.posts.map((post: Post) => (post.id === postId ? p : post)),
                };
              });
            });
          }
        },
        // onSettledでinvalidateしない（楽観的更新のみで対応）
      }
    );
  };

  const onUnlike = (postId: number) => {
    const detailKey = getGetPostsIdQueryKey(postId);
    const prev = queryClient.getQueryData<Post | undefined>(detailKey);
    const listPrev = captureListPrev(queryClient, postId);

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
            // リスト内のキャッシュも個別にロールバック
            listPrev.forEach(({ key, prev: p }) => {
              if (!p) return;
              queryClient.setQueryData(key, (data: { posts: Post[] } | undefined) => {
                if (!data?.posts) return data;
                return {
                  ...data,
                  posts: data.posts.map((post: Post) => (post.id === postId ? p : post)),
                };
              });
            });
          }
        },
        // onSettledでinvalidateしない（楽観的更新のみで対応）
      }
    );
  };

  return { onLike, onUnlike };
}
