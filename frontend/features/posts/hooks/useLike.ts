import { useQueryClient } from "@tanstack/react-query";
import type { GoShishaBackendInternalModelsPost } from "@/api/model";
import {
  usePostPostsIdLike,
  usePostPostsIdUnlike,
  getGetPostsIdQueryKey,
  getGetPostsQueryKey,
} from "@/api/posts";

export function useLike() {
  const queryClient = useQueryClient();
  const likeMut = usePostPostsIdLike();
  const unlikeMut = usePostPostsIdUnlike();

  const onLike = (postId: number) => {
    const detailKey = getGetPostsIdQueryKey(postId);
    const prev = queryClient.getQueryData<GoShishaBackendInternalModelsPost | undefined>(detailKey);

    // optimistic update: increment
    queryClient.setQueryData<GoShishaBackendInternalModelsPost | undefined>(detailKey, (old) =>
      old ? { ...old, likes: (old.likes ?? 0) + 1, is_liked: true } : old
    );

    likeMut.mutate(
      { id: postId },
      {
        onError: () => {
          if (prev) queryClient.setQueryData(detailKey, prev);
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: detailKey });
        },
      }
    );
  };

  const onUnlike = (postId: number) => {
    const detailKey = getGetPostsIdQueryKey(postId);
    const prev = queryClient.getQueryData<GoShishaBackendInternalModelsPost | undefined>(detailKey);

    // optimistic update: decrement
    queryClient.setQueryData<GoShishaBackendInternalModelsPost | undefined>(detailKey, (old) =>
      old ? { ...old, likes: Math.max(0, (old.likes ?? 0) - 1), is_liked: false } : old
    );

    unlikeMut.mutate(
      { id: postId },
      {
        onError: () => {
          if (prev) queryClient.setQueryData(detailKey, prev);
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: detailKey });
        },
      }
    );
  };

  return { onLike, onUnlike };
}
