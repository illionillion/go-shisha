import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getGetPostsIdQueryKey, getGetPostsQueryKey, usePatchPostsId } from "@/api/posts";
import type { UpdatePostInput } from "@/types/domain";
import { getUpdatePostErrorMessage } from "../utils/updatePostErrors";

/**
 * 投稿編集フック
 *
 * 編集成功後は詳細キャッシュ・全投稿リスト・ユーザー別投稿リストのキャッシュを無効化する。
 *
 * @param options.onSuccess - 編集成功時のコールバック
 */
export function useUpdatePost(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const updateMut = usePatchPostsId();

  /**
   * 指定IDの投稿を更新する
   */
  const onUpdate = (postId: number, input: UpdatePostInput) => {
    updateMut.mutate(
      { id: postId, data: input },
      {
        onSuccess: () => {
          // 詳細キャッシュを無効化
          queryClient.invalidateQueries({ queryKey: getGetPostsIdQueryKey(postId) });

          // 全投稿リストキャッシュを無効化
          queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });

          // ユーザー別投稿リストキャッシュも無効化
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey;
              if (!Array.isArray(key) || typeof key[0] !== "string") return false;
              return /^\/users\/\d+\/posts$/.test(String(key[0]));
            },
          });

          toast.success("投稿を更新しました");
          options?.onSuccess?.();
        },
        onError: (error) => {
          toast.error(getUpdatePostErrorMessage(error));
        },
      }
    );
  };

  return { onUpdate, isPending: updateMut.isPending };
}
