import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getGetAuthMeQueryKey } from "@/api/auth";
import { getGetUsersIdQueryKey, usePatchUsersMe } from "@/api/users";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { UpdateUserInput, User } from "@/types/domain";

/**
 * プロフィール更新フック
 *
 * 自分のプロフィールを更新し、キャッシュの無効化とAuth Storeの更新を行う。
 *
 * @param options.userId - 更新対象ユーザーのID（キャッシュ無効化に使用）
 * @param options.onSuccess - 更新成功時のコールバック（更新後のユーザー情報を受け取る）
 */
export function useUpdateProfile(options?: { userId?: number; onSuccess?: (user: User) => void }) {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const patchMut = usePatchUsersMe();

  /**
   * プロフィールを更新する
   */
  const onUpdate = (input: UpdateUserInput) => {
    patchMut.mutate(
      { data: input },
      {
        onSuccess: (response) => {
          if (response.status !== 200) return;
          const updatedUser = response.data;

          // AuthStoreのユーザー情報を更新
          setUser(updatedUser);

          // /auth/me キャッシュを無効化
          queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });

          // ユーザー詳細キャッシュを無効化
          if (options?.userId != null) {
            queryClient.invalidateQueries({
              queryKey: getGetUsersIdQueryKey(options.userId),
            });
          }

          toast.success("プロフィールを更新しました");
          options?.onSuccess?.(updatedUser);
        },
        onError: () => {
          toast.error("プロフィールの更新に失敗しました");
        },
      }
    );
  };

  return { onUpdate, isPending: patchMut.isPending };
}
