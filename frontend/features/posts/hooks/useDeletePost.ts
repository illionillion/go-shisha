import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeletePostsId, getGetPostsQueryKey, getGetPostsIdQueryKey } from "@/api/posts";
import { getGetUsersIdPostsQueryKey } from "@/api/users";
import type { Post } from "@/types/domain";
import { getDeletePostErrorMessage } from "../utils/deletePostErrors";

/**
 * 投稿削除フック
 *
 * 削除成功後は全投稿リスト・ユーザー別投稿リストのキャッシュを無効化する。
 * 詳細ページから削除した場合は一覧ページへリダイレクトする。
 *
 * @param options.onSuccess - 削除成功時のコールバック（省略時はトースト通知のみ）
 * @param options.redirectOnSuccess - 成功時にトップへリダイレクトするか（デフォルト: false）
 */
export function useDeletePost(options?: { onSuccess?: () => void; redirectOnSuccess?: boolean }) {
  const queryClient = useQueryClient();
  const deleteMut = useDeletePostsId();
  const router = useRouter();

  /**
   * 指定IDの投稿を削除する
   */
  const onDelete = (postId: number) => {
    deleteMut.mutate(
      { id: postId },
      {
        onSuccess: () => {
          // 詳細キャッシュを削除
          const detailKey = getGetPostsIdQueryKey(postId);
          queryClient.removeQueries({ queryKey: detailKey });

          // 全投稿リストキャッシュを無効化
          queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });

          // ユーザー別投稿リストキャッシュも無効化
          queryClient.getQueriesData<{ posts: Post[] }>({}).forEach(([key, data]) => {
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
            queryClient.invalidateQueries({ queryKey: key });
          });

          toast.success("投稿を削除しました");
          options?.onSuccess?.();

          if (options?.redirectOnSuccess) {
            router.push("/");
          }
        },
        onError: (error) => {
          toast.error(getDeletePostErrorMessage(error));
        },
      }
    );
  };

  return { onDelete, isPending: deleteMut.isPending };
}
