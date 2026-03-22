import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode, JSX } from "react";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as postsApi from "@/api/posts";
import { useUpdatePost } from "./useUpdatePost";

// sonnerのモック
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// APIモジュールのモック
vi.mock("@/api/posts", () => ({
  usePatchPostsId: vi.fn(),
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

describe("useUpdatePost", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

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
  });

  it("onUpdateを呼び出すとmutateが実行される", () => {
    const mockMutate = vi.fn();
    vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

    const { result } = renderHook(() => useUpdatePost(), { wrapper });

    act(() => {
      result.current.onUpdate(1, { slides: [{ id: 1, text: "updated" }] });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { id: 1, data: { slides: [{ id: 1, text: "updated" }] } },
      expect.any(Object)
    );
  });

  it("isPendingがfalseの場合はfalseを返す", () => {
    vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

    const { result } = renderHook(() => useUpdatePost(), { wrapper });

    expect(result.current.isPending).toBe(false);
  });

  it("isPendingがtrueの場合はtrueを返す", () => {
    vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

    const { result } = renderHook(() => useUpdatePost(), { wrapper });

    expect(result.current.isPending).toBe(true);
  });

  describe("成功時の副作用", () => {
    it("onSuccess: toast.successが呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

      const { result } = renderHook(() => useUpdatePost(), { wrapper });

      act(() => {
        result.current.onUpdate(1, { slides: [{ id: 1 }] });
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(vi.mocked(toast.success)).toHaveBeenCalledWith("投稿を更新しました");
    });

    it("onSuccess: 詳細キャッシュがinvalidateされる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdatePost(), { wrapper });

      act(() => {
        result.current.onUpdate(1, { slides: [{ id: 1 }] });
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["/posts/1"] });
    });

    it("onSuccess: 全投稿リストキャッシュがinvalidateされる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdatePost(), { wrapper });

      act(() => {
        result.current.onUpdate(1, { slides: [{ id: 1 }] });
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
      vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

      const { result } = renderHook(() => useUpdatePost({ onSuccess: onSuccessCallback }), {
        wrapper,
      });

      act(() => {
        result.current.onUpdate(1, { slides: [{ id: 1 }] });
      });

      const { onSuccess } = getMutateCallbacks(mockMutate);
      act(() => {
        onSuccess?.();
      });

      expect(onSuccessCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("失敗時の副作用", () => {
    it("onError: toast.errorが呼ばれる", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

      const { result } = renderHook(() => useUpdatePost(), { wrapper });

      act(() => {
        result.current.onUpdate(1, { slides: [{ id: 1 }] });
      });

      const callbacks = getMutateCallbacks(mockMutate);
      act(() => {
        callbacks?.onError?.(new Error("network error"));
      });

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("投稿の編集に失敗しました");
    });

    it("onError: forbidden エラーコードで適切なメッセージが表示される", () => {
      const mockMutate = vi.fn();
      vi.mocked(postsApi.usePatchPostsId).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof postsApi.usePatchPostsId>);

      const { result } = renderHook(() => useUpdatePost(), { wrapper });

      act(() => {
        result.current.onUpdate(1, { slides: [{ id: 1 }] });
      });

      const apiError = Object.assign(new Error("API Error: 403"), {
        status: 403,
        bodyJson: { error: "forbidden" },
      });

      const callbacks = getMutateCallbacks(mockMutate);
      act(() => {
        callbacks?.onError?.(apiError);
      });

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("この投稿を編集する権限がありません");
    });
  });
});
