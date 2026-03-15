import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { useRouter } from "next/navigation";
import type { ReactNode, JSX } from "react";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as postsApi from "@/api/posts";
import { useDeletePost } from "./useDeletePost";

// next/navigationのモック
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// sonnerのモック（vi.mockはホイストされるためfactoryの外で変数を参照できない）
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// APIモジュールのモック
vi.mock("@/api/posts", () => ({
  useDeletePostsId: vi.fn(),
  getGetPostsQueryKey: vi.fn(() => ["/posts"]),
  getGetPostsIdQueryKey: vi.fn((id: number) => [`/posts/${id}`]),
}));

/** mutate の第2引数に渡された callbacks を手動で実行するヘルパー */
function getMutateCallbacks(mockMutate: ReturnType<typeof vi.fn>) {
  const call = mockMutate.mock.calls[0];
  return call?.[1] as {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  };
}

describe("useDeletePost", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;
  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();

    // vi.clearAllMocks の後に useRouter のモックを再設定
    mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  it("onDeleteを呼び出すとmutateが実行される", () => {
    const mockMutate = vi.fn();
    vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

    const { result } = renderHook(() => useDeletePost(), { wrapper });

    act(() => {
      result.current.onDelete(1);
    });

    expect(mockMutate).toHaveBeenCalledWith({ id: 1 }, expect.any(Object));
  });

  it("isPendingがfalseの場合はfalseを返す", () => {
    const mockMutate = vi.fn();
    vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

    const { result } = renderHook(() => useDeletePost(), { wrapper });

    expect(result.current.isPending).toBe(false);
  });

  it("isPendingがtrueの場合はtrueを返す", () => {
    vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

    const { result } = renderHook(() => useDeletePost(), { wrapper });

    expect(result.current.isPending).toBe(true);
  });

  describe("成功時の副作用", () => {
    it("onSuccess: toast.successが呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

      const { result } = renderHook(() => useDeletePost(), { wrapper });

      act(() => {
        result.current.onDelete(1);
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(vi.mocked(toast.success)).toHaveBeenCalledWith("投稿を削除しました");
    });

    it("onSuccess: queryClient.invalidateQueriesが呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeletePost(), { wrapper });

      act(() => {
        result.current.onDelete(1);
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["/posts"] });
    });

    it("onSuccess: options.onSuccessコールバックが呼ばれる", () => {
      const mockMutate = vi.fn();
      const onSuccessCallback = vi.fn();
      vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

      const { result } = renderHook(() => useDeletePost({ onSuccess: onSuccessCallback }), {
        wrapper,
      });

      act(() => {
        result.current.onDelete(1);
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(onSuccessCallback).toHaveBeenCalledTimes(1);
    });

    it("redirectOnSuccess: true のとき router.push('/') が呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

      const { result } = renderHook(() => useDeletePost({ redirectOnSuccess: true }), { wrapper });

      act(() => {
        result.current.onDelete(1);
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("redirectOnSuccess: false のとき router.push は呼ばれない", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

      const { result } = renderHook(() => useDeletePost({ redirectOnSuccess: false }), {
        wrapper,
      });

      act(() => {
        result.current.onDelete(1);
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("失敗時の副作用", () => {
    it("onError: toast.errorが呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

      const { result } = renderHook(() => useDeletePost(), { wrapper });

      act(() => {
        result.current.onDelete(1);
      });

      const callbacks = getMutateCallbacks(mockMutate);
      act(() => {
        callbacks?.onError?.(new Error("network error"));
      });

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("投稿の削除に失敗しました");
    });

    it("onError: forbidden エラーコードで適切なメッセージが表示される", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.useDeletePostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.useDeletePostsId>);

      const { result } = renderHook(() => useDeletePost(), { wrapper });

      act(() => {
        result.current.onDelete(1);
      });

      const apiError = Object.assign(new Error("API Error: 403"), {
        status: 403,
        bodyJson: { error: "forbidden" },
      });

      const callbacks = getMutateCallbacks(mockMutate);
      act(() => {
        callbacks?.onError?.(apiError);
      });

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("この投稿を削除する権限がありません");
    });
  });
});
