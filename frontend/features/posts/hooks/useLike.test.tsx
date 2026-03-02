import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode, JSX } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as postsApi from "@/api/posts";
import type { Post } from "@/types/domain";
import { useLike } from "./useLike";

// APIモジュールのモック
vi.mock("@/api/posts", () => ({
  usePostPostsIdLike: vi.fn(),
  usePostPostsIdUnlike: vi.fn(),
  getGetPostsIdQueryKey: vi.fn((id: number) => ["posts", id]),
  getGetPostsQueryKey: vi.fn(() => ["posts"]),
}));

describe("useLike", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  describe("onLike", () => {
    it("いいねをすると楽観的更新でlikesが+1される", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: false,
        slides: [],
      };

      // 初期データをキャッシュに設定
      queryClient.setQueryData(["posts", postId], initialPost);

      const { result } = renderHook(() => useLike(), { wrapper });

      // onLikeを実行
      result.current.onLike(postId);

      // 楽観的更新が適用されたか確認
      const updatedPost = queryClient.getQueryData<Post>(["posts", postId]);
      expect(updatedPost).toEqual({
        ...initialPost,
        likes: 11,
        is_liked: true,
      });
    });

    it("いいねのmutateが正しいパラメータで呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onLike(5);

      expect(mockMutate).toHaveBeenCalledWith(
        { id: 5 },
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );
      expect(mockMutate).toHaveBeenCalledWith(
        { id: 5 },
        expect.not.objectContaining({
          onSettled: expect.any(Function),
        })
      );
    });

    it("likesがundefinedの場合、0として扱われる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: undefined,
        is_liked: false,
        slides: [],
      };

      queryClient.setQueryData(["posts", postId], initialPost);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onLike(postId);

      const updatedPost = queryClient.getQueryData<Post>(["posts", postId]);
      expect(updatedPost?.likes).toBe(1);
    });

    it("エラー時に前のデータにロールバックされる", async () => {
      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: false,
        slides: [],
      };

      queryClient.setQueryData(["posts", postId], initialPost);

      const mockMutate = vi.fn((params, options) => {
        // エラーコールバックを即座に実行
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onLike(postId);

      // エラー後、元のデータに戻っているか確認
      const rolledBackPost = queryClient.getQueryData<Post>(["posts", postId]);
      expect(rolledBackPost).toEqual(initialPost);
    });

    it("エラー時にリスト内の投稿もロールバックされる", () => {
      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: false,
        slides: [],
      };

      const initialList = [
        { id: postId, user_id: 1, likes: 10, is_liked: false, slides: [] },
        { id: 2, user_id: 2, likes: 5, is_liked: false, slides: [] },
      ];

      // 詳細とユーザー一覧（/users/1/posts）両方にキャッシュを設定
      queryClient.setQueryData(["posts", postId], initialPost);
      queryClient.setQueryData(["/users/1/posts"], { posts: initialList });

      const mockMutate = vi.fn((params, options) => {
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onLike(postId);

      // 詳細がロールバックされる
      const detail = queryClient.getQueryData<Post>(["posts", postId]);
      expect(detail).toEqual(initialPost);

      // ユーザー一覧の該当投稿もロールバックされる
      const list = queryClient.getQueryData<{ posts: Post[] }>(["/users/1/posts"]);
      expect(list?.posts[0]).toEqual(initialList[0]);
      expect(list?.posts[1]).toEqual(initialList[1]);
    });

    it("エラー時にキャッシュがクリアされていた場合もロールバックがクラッシュしない", () => {
      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: false,
        slides: [],
      };

      const initialList = [{ id: postId, user_id: 1, likes: 10, is_liked: false, slides: [] }];

      queryClient.setQueryData(["posts", postId], initialPost);
      queryClient.setQueryData(["posts"], { posts: initialList });

      const mockMutate = vi.fn((params, options) => {
        // エラーコールバック前にキャッシュを空データに更新
        queryClient.setQueryData(["posts"], { noPostsField: [] });
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      // クラッシュしないことを確認
      expect(() => result.current.onLike(postId)).not.toThrow();
    });

    it("リスト内の投稿も楽観的に更新される", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const postId = 1;
      const initialPosts = [
        { id: postId, user_id: 1, likes: 10, is_liked: false, slides: [] },
        { id: 2, user_id: 2, likes: 20, is_liked: false, slides: [] },
      ];

      // リストデータをキャッシュに設定
      queryClient.setQueryData(["posts"], { posts: initialPosts });

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onLike(postId);

      // リスト内の該当投稿が更新されているか確認
      const updatedList = queryClient.getQueryData<{ posts: Post[] }>(["posts"]);
      expect(updatedList?.posts[0]).toEqual({
        ...initialPosts[0],
        likes: 11,
        is_liked: true,
      });
      expect(updatedList?.posts[1]).toEqual(initialPosts[1]); // 他の投稿は変わらない
    });

    it("キャッシュにデータがない場合でもエラーにならない", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      // キャッシュにデータがない状態で実行
      expect(() => result.current.onLike(999)).not.toThrow();

      // mutateは呼ばれる
      expect(mockMutate).toHaveBeenCalled();
    });

    it("キャッシュにデータがない状態でエラーが発生してもロールバックしない", () => {
      const postId = 999;

      // キャッシュにデータがない状態でエラーを発生させる
      const mockMutate = vi.fn((params, options) => {
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onLike(postId);

      // キャッシュにデータがないのでロールバックも発生しない
      const cacheData = queryClient.getQueryData<Post>(["posts", postId]);
      expect(cacheData).toBeUndefined();

      // mutateは呼ばれる
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe("onUnlike", () => {
    it("いいね解除をすると楽観的更新でlikesが-1される", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: true,
        slides: [],
      };

      queryClient.setQueryData(["posts", postId], initialPost);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(postId);

      const updatedPost = queryClient.getQueryData<Post>(["posts", postId]);
      expect(updatedPost).toEqual({
        ...initialPost,
        likes: 9,
        is_liked: false,
      });
    });

    it("likesが0の場合、マイナスにならない", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 0,
        is_liked: true,
        slides: [],
      };

      queryClient.setQueryData(["posts", postId], initialPost);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(postId);

      const updatedPost = queryClient.getQueryData<Post>(["posts", postId]);
      expect(updatedPost?.likes).toBe(0);
    });

    it("likesがundefinedの場合、0として扱われる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: undefined,
        is_liked: true,
        slides: [],
      };

      queryClient.setQueryData(["posts", postId], initialPost);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(postId);

      const updatedPost = queryClient.getQueryData<Post>(["posts", postId]);
      expect(updatedPost?.likes).toBe(0);
    });

    it("いいね解除のmutateが正しいパラメータで呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(7);

      expect(mockMutate).toHaveBeenCalledWith(
        { id: 7 },
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );
      expect(mockMutate).toHaveBeenCalledWith(
        { id: 7 },
        expect.not.objectContaining({
          onSettled: expect.any(Function),
        })
      );
    });

    it("エラー時に前のデータにロールバックされる", () => {
      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: true,
        slides: [],
      };

      queryClient.setQueryData(["posts", postId], initialPost);

      const mockMutate = vi.fn((params, options) => {
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(postId);

      const rolledBackPost = queryClient.getQueryData<Post>(["posts", postId]);
      expect(rolledBackPost).toEqual(initialPost);
    });

    it("エラー時にリスト内の投稿もロールバックされる", () => {
      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: true,
        slides: [],
      };

      const initialList = [
        { id: postId, user_id: 1, likes: 10, is_liked: true, slides: [] },
        { id: 2, user_id: 2, likes: 5, is_liked: false, slides: [] },
      ];

      // 詳細とユーザー一覧（/users/1/posts）両方にキャッシュを設定
      queryClient.setQueryData(["posts", postId], initialPost);
      queryClient.setQueryData(["/users/1/posts"], { posts: initialList });

      const mockMutate = vi.fn((params, options) => {
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(postId);

      // 詳細がロールバックされる
      const detail = queryClient.getQueryData<Post>(["posts", postId]);
      expect(detail).toEqual(initialPost);

      // ユーザー一覧の該当投稿もロールバックされる
      const list = queryClient.getQueryData<{ posts: Post[] }>(["/users/1/posts"]);
      expect(list?.posts[0]).toEqual(initialList[0]);
      expect(list?.posts[1]).toEqual(initialList[1]);
    });

    it("エラー時にキャッシュがクリアされていた場合もロールバックがクラッシュしない", () => {
      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: true,
        slides: [],
      };

      const initialList = [{ id: postId, user_id: 1, likes: 10, is_liked: true, slides: [] }];

      queryClient.setQueryData(["posts", postId], initialPost);
      queryClient.setQueryData(["posts"], { posts: initialList });

      const mockMutate = vi.fn((params, options) => {
        // エラーコールバック前にキャッシュを空データに更新
        queryClient.setQueryData(["posts"], { noPostsField: [] });
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      // クラッシュしないことを確認
      expect(() => result.current.onUnlike(postId)).not.toThrow();
    });

    it("リスト内の投稿も楽観的に更新される", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const postId = 1;
      const initialPosts = [
        { id: postId, user_id: 1, likes: 10, is_liked: true, slides: [] },
        { id: 2, user_id: 2, likes: 20, is_liked: false, slides: [] },
      ];

      // リストデータをキャッシュに設定
      queryClient.setQueryData(["posts"], { posts: initialPosts });

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(postId);

      // リスト内の該当投稿が更新されているか確認
      const updatedList = queryClient.getQueryData<{ posts: Post[] }>(["posts"]);
      expect(updatedList?.posts[0]).toEqual({
        ...initialPosts[0],
        likes: 9,
        is_liked: false,
      });
      expect(updatedList?.posts[1]).toEqual(initialPosts[1]); // 他の投稿は変わらない
    });

    it("キャッシュにデータがない場合でもエラーにならない", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      expect(() => result.current.onUnlike(999)).not.toThrow();
      expect(mockMutate).toHaveBeenCalled();
    });

    it("キャッシュにデータがない状態でエラーが発生してもロールバックしない", () => {
      const postId = 999;

      // キャッシュにデータがない状態でエラーを発生させる
      const mockMutate = vi.fn((params, options) => {
        if (options?.onError) {
          options.onError(new Error("Network error"), params, undefined);
        }
      });

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: mockMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      const { result } = renderHook(() => useLike(), { wrapper });

      result.current.onUnlike(postId);

      // キャッシュにデータがないのでロールバックも発生しない
      const cacheData = queryClient.getQueryData<Post>(["posts", postId]);
      expect(cacheData).toBeUndefined();

      // mutateは呼ばれる
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe("複数回の操作", () => {
    it("いいね→解除を繰り返しても正しく動作する", () => {
      const likeMutate = vi.fn();
      const unlikeMutate = vi.fn();

      vi.mocked(postsApi.usePostPostsIdLike).mockReturnValue({
        mutate: likeMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdLike>);

      vi.mocked(postsApi.usePostPostsIdUnlike).mockReturnValue({
        mutate: unlikeMutate,
      } as unknown as ReturnType<typeof postsApi.usePostPostsIdUnlike>);

      const postId = 1;
      const initialPost: Post = {
        id: postId,
        user_id: 1,
        likes: 10,
        is_liked: false,
        slides: [],
      };

      queryClient.setQueryData(["posts", postId], initialPost);

      const { result } = renderHook(() => useLike(), { wrapper });

      // いいね
      result.current.onLike(postId);
      let post = queryClient.getQueryData<Post>(["posts", postId]);
      expect(post?.likes).toBe(11);
      expect(post?.is_liked).toBe(true);

      // 解除
      result.current.onUnlike(postId);
      post = queryClient.getQueryData<Post>(["posts", postId]);
      expect(post?.likes).toBe(10);
      expect(post?.is_liked).toBe(false);

      // 再度いいね
      result.current.onLike(postId);
      post = queryClient.getQueryData<Post>(["posts", postId]);
      expect(post?.likes).toBe(11);
      expect(post?.is_liked).toBe(true);
    });
  });
});
