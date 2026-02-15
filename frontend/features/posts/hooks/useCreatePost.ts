import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGetPostsQueryKey } from "@/api/posts";
import type { ApiError } from "@/lib/api-client";
import { apiFetch } from "@/lib/api-client";
import { isSuccessResponse } from "@/lib/api-helpers";
import type { CreatePostInput, Post } from "@/types/domain";

/**
 * APIエラーメッセージを日本語で返す
 *
 * @param error - API エラーオブジェクト
 * @returns 日本語エラーメッセージ
 */
export const translateErrorMessage = (error: ApiError): string => {
  // ApiError.bodyJsonからエラーメッセージを取得
  if (
    error.bodyJson &&
    typeof error.bodyJson === "object" &&
    "error" in error.bodyJson &&
    typeof error.bodyJson.error === "string"
  ) {
    // バックエンドが日本語メッセージを返すのでそのまま使用
    return error.bodyJson.error;
  }
  return "投稿の作成に失敗しました";
};

/**
 * 投稿作成用カスタムフック
 *
 * 投稿を作成し、楽観的更新（Optimistic Update）を行います。
 * 投稿成功後、タイムラインキャッシュを自動更新します。
 *
 * @example
 * ```tsx
 * const { createPost, isPending } = useCreatePost({
 *   onSuccess: (post) => {
 *     console.log("投稿成功:", post.id);
 *     router.push("/"); // タイムラインへ遷移
 *   },
 *   onError: (error) => {
 *     toast.error(error); // エラー表示
 *   },
 * });
 *
 * // 投稿作成
 * const handleSubmit = async () => {
 *   createPost({
 *     slides: [
 *       { image_url: "/uploads/image1.jpg", text: "おいしかった", flavor_id: 1 },
 *       { image_url: "/uploads/image2.jpg", text: "", flavor_id: null },
 *     ],
 *   });
 * };
 * ```
 */
export function useCreatePost(options?: {
  onSuccess?: (post: Post) => void;
  onError?: (error: string) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { data: Post; status: 201; headers: Headers },
    ApiError,
    CreatePostInput
  >({
    mutationFn: async (input: CreatePostInput) => {
      const response = await apiFetch<{ data: Post; status: 201; headers: Headers }>("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      return response as { data: Post; status: 201; headers: Headers };
    },
    onMutate: async (newPost: CreatePostInput) => {
      // タイムラインキャッシュのキーを取得
      const queryKey = getGetPostsQueryKey();

      // 進行中のクエリをキャンセル（楽観的更新との競合を防ぐ）
      await queryClient.cancelQueries({ queryKey });

      // 以前のキャッシュデータを保存（ロールバック用）
      const previousPosts = queryClient.getQueryData(queryKey);

      // 楽観的更新：新しい投稿を仮で追加
      // （実際のレスポンスが返ってきた時点で正しいデータに置き換わる）
      queryClient.setQueryData(queryKey, (old: unknown) => {
        // 型ガード：oldがレスポンス形式であることを確認
        if (
          old &&
          typeof old === "object" &&
          "data" in old &&
          typeof old.data === "object" &&
          old.data &&
          "posts" in old.data &&
          Array.isArray(old.data.posts) &&
          "total" in old.data &&
          typeof old.data.total === "number"
        ) {
          // 仮の投稿オブジェクトを作成（IDは仮）
          const optimisticPost: Post = {
            id: Date.now(), // 仮ID（サーバーからの実IDで後で置き換わる）
            user_id: 0, // 認証情報から取得できればベター（今は仮）
            created_at: new Date().toISOString(),
            user: {
              id: 0,
              email: "",
              display_name: "あなた",
              icon_url: "",
              description: "",
              external_url: "",
            },
            slides: newPost.slides.map((slide) => ({
              image_url: slide.image_url,
              text: slide.text,
              flavor: undefined, // フレーバー情報はサーバーから返る
            })),
            likes: 0,
            is_liked: false,
          };

          return {
            ...old,
            data: {
              ...old.data,
              posts: [optimisticPost, ...old.data.posts], // 先頭に追加
              total: old.data.total + 1,
            },
          };
        }
        return old;
      });

      // ロールバック用に以前のデータを返す
      return { previousPosts } as { previousPosts: unknown };
    },
    onSuccess: (response, _variables, _context) => {
      if (isSuccessResponse(response) && response.data) {
        // 投稿成功後、タイムラインキャッシュを無効化して最新データをフェッチ
        queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });

        options?.onSuccess?.(response.data);
      }
    },
    onError: (error, _variables, context) => {
      // エラー発生時、楽観的更新をロールバック
      const typedContext = context as { previousPosts: unknown } | undefined;
      if (typedContext?.previousPosts !== undefined) {
        queryClient.setQueryData(getGetPostsQueryKey(), typedContext.previousPosts);
      }

      const message = translateErrorMessage(error);
      options?.onError?.(message);
    },
  });

  const createPost = (input: CreatePostInput) => {
    // スライドが空の場合はエラー
    if (!input.slides || input.slides.length === 0) {
      options?.onError?.("最低1枚の画像が必要です");
      return;
    }

    mutation.mutate(input);
  };

  return {
    createPost,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
