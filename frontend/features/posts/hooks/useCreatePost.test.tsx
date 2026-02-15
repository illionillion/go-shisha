import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGetPostsQueryKey } from "@/api/posts";
import type { ApiError } from "@/lib/api-client";
import * as apiClient from "@/lib/api-client";
import type { CreatePostInput, Post } from "@/types/domain";
import { useCreatePost, translateErrorMessage } from "./useCreatePost";

vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn(),
  isSuccessResponse: vi.fn((response) => response.status >= 200 && response.status < 300),
}));

describe("useCreatePost", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => React.ReactElement;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    vi.clearAllMocks();
  });

  describe("投稿作成", () => {
    it("投稿作成リクエストが正しく送信される", async () => {
      const mockPost: Post = {
        id: 1,
        user_id: 1,
        created_at: "2024-01-01T00:00:00Z",
        user: {
          id: 1,
          email: "test@example.com",
          display_name: "テストユーザー",
          icon_url: "",
          description: "",
          external_url: "",
        },
        slides: [
          {
            image_url: "/uploads/image1.jpg",
            text: "おいしかった",
            flavor: { id: 1, name: "ミント", color: "#00FF00" },
          },
        ],
        likes: 0,
        is_liked: false,
      };

      vi.mocked(apiClient.apiFetch).mockResolvedValue({
        data: mockPost,
        status: 201,
        headers: new Headers(),
      });

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      const input: CreatePostInput = {
        slides: [{ image_url: "/uploads/image1.jpg", text: "おいしかった", flavor_id: 1 }],
      };
      result.current.createPost(input);

      await waitFor(() => {
        expect(apiClient.apiFetch).toHaveBeenCalledOnce();
      });

      const callArgs = vi.mocked(apiClient.apiFetch).mock.calls[0];
      expect(callArgs[0]).toBe("/posts");
      expect(callArgs[1]?.method).toBe("POST");
      expect(callArgs[1]?.headers).toEqual({ "Content-Type": "application/json" });
      expect(callArgs[1]?.body).toBe(JSON.stringify(input));
    });

    it("投稿成功時にonSuccessが呼ばれる", async () => {
      const onSuccess = vi.fn();
      const mockPost: Post = {
        id: 1,
        user_id: 1,
        created_at: "2024-01-01T00:00:00Z",
        user: {
          id: 1,
          email: "test@example.com",
          display_name: "テストユーザー",
          icon_url: "",
          description: "",
          external_url: "",
        },
        slides: [
          {
            image_url: "/uploads/image1.jpg",
            text: "おいしかった",
          },
        ],
        likes: 0,
        is_liked: false,
      };

      vi.mocked(apiClient.apiFetch).mockResolvedValue({
        data: mockPost,
        status: 201,
        headers: new Headers(),
      });

      const { result } = renderHook(() => useCreatePost({ onSuccess }), { wrapper });

      const input: CreatePostInput = {
        slides: [{ image_url: "/uploads/image1.jpg", text: "おいしかった", flavor_id: 1 }],
      };
      result.current.createPost(input);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockPost);
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("投稿中はisPendingがtrueになる", async () => {
      vi.mocked(apiClient.apiFetch).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      const input: CreatePostInput = {
        slides: [{ image_url: "/uploads/image1.jpg" }],
      };
      result.current.createPost(input);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });
    });

    it("APIエラー時にonErrorが呼ばれる", async () => {
      const onError = vi.fn();
      const mockError = {
        bodyJson: {
          error: "投稿の作成に失敗しました",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreatePost({ onError }), { wrapper });

      const input: CreatePostInput = {
        slides: [{ image_url: "/uploads/image1.jpg" }],
      };
      result.current.createPost(input);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("投稿の作成に失敗しました");
      });
    });
  });

  describe("楽観的更新", () => {
    it("投稿作成時にタイムラインキャッシュが楽観的に更新される", async () => {
      const existingPosts: Post[] = [
        {
          id: 999,
          user_id: 2,
          created_at: "2024-01-01T00:00:00Z",
          user: {
            id: 2,
            email: "existing@example.com",
            display_name: "既存ユーザー",
            icon_url: "",
            description: "",
            external_url: "",
          },
          slides: [],
          likes: 5,
          is_liked: false,
        },
      ];

      // 既存キャッシュをセット
      queryClient.setQueryData(getGetPostsQueryKey(), {
        data: {
          posts: existingPosts,
          total: 1,
        },
        status: 200,
        headers: new Headers(),
      });

      vi.mocked(apiClient.apiFetch).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      const input: CreatePostInput = {
        slides: [{ image_url: "/uploads/new.jpg", text: "新しい投稿" }],
      };
      result.current.createPost(input);

      // 楽観的更新が適用されたか確認
      await waitFor(() => {
        const cache = queryClient.getQueryData(getGetPostsQueryKey()) as {
          data: { posts: Post[]; total: number };
        };
        expect(cache.data.posts.length).toBe(2); // 既存1 + 新規1
        expect(cache.data.total).toBe(2);
        expect(cache.data.posts[0].slides?.[0]?.text).toBe("新しい投稿"); // 新しい投稿が先頭
      });
    });

    it("投稿成功後にタイムラインキャッシュが無効化される", async () => {
      const mockPost: Post = {
        id: 1,
        user_id: 1,
        created_at: "2024-01-01T00:00:00Z",
        user: {
          id: 1,
          email: "test@example.com",
          display_name: "テストユーザー",
          icon_url: "",
          description: "",
          external_url: "",
        },
        slides: [],
        likes: 0,
        is_liked: false,
      };

      vi.mocked(apiClient.apiFetch).mockResolvedValue({
        data: mockPost,
        status: 201,
        headers: new Headers(),
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      const input: CreatePostInput = {
        slides: [{ image_url: "/uploads/image1.jpg" }],
      };
      result.current.createPost(input);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: getGetPostsQueryKey() });
      });
    });

    it("投稿エラー時に楽観的更新がロールバックされる", async () => {
      const existingPosts: Post[] = [
        {
          id: 999,
          user_id: 2,
          created_at: "2024-01-01T00:00:00Z",
          user: {
            id: 2,
            email: "existing@example.com",
            display_name: "既存ユーザー",
            icon_url: "",
            description: "",
            external_url: "",
          },
          slides: [],
          likes: 5,
          is_liked: false,
        },
      ];

      const previousCache = {
        data: {
          posts: existingPosts,
          total: 1,
        },
        status: 200,
        headers: new Headers(),
      };

      // 既存キャッシュをセット
      queryClient.setQueryData(getGetPostsQueryKey(), previousCache);

      const mockError = {
        bodyJson: {
          error: "投稿の作成に失敗しました",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      const input: CreatePostInput = {
        slides: [{ image_url: "/uploads/new.jpg", text: "新しい投稿" }],
      };
      result.current.createPost(input);

      // エラー後、キャッシュが元に戻っているか確認
      await waitFor(() => {
        const cache = queryClient.getQueryData(getGetPostsQueryKey()) as {
          data: { posts: Post[]; total: number };
        };
        expect(cache.data.posts.length).toBe(1); // 元の1件に戻る
        expect(cache.data.total).toBe(1);
        expect(cache.data.posts[0].id).toBe(999); // 既存の投稿
      });
    });
  });

  describe("バリデーション", () => {
    it("スライドが空の場合、onErrorが呼ばれる", () => {
      const onError = vi.fn();

      const { result } = renderHook(() => useCreatePost({ onError }), { wrapper });

      result.current.createPost({ slides: [] });

      expect(onError).toHaveBeenCalledWith("最低1枚の画像が必要です");
      expect(apiClient.apiFetch).not.toHaveBeenCalled();
    });
  });

  describe("translateErrorMessage", () => {
    it("バックエンドの日本語エラーメッセージをそのまま返す", () => {
      const error: ApiError = {
        bodyJson: { error: "投稿の作成に失敗しました" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("投稿の作成に失敗しました");
    });

    it("バリデーションエラーメッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: "スライドが1枚以上必要です" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("スライドが1枚以上必要です");
    });

    it("bodyJsonがない場合はデフォルトメッセージを返す", () => {
      const error: ApiError = {} as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("投稿の作成に失敗しました");
    });

    it("bodyJson.errorが文字列でない場合はデフォルトメッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: 123 },
      } as unknown as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("投稿の作成に失敗しました");
    });
  });
});
