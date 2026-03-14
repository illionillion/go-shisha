import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode, JSX } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as postsApi from "@/api/posts";
import { useDeletePost } from "./useDeletePost";

// next/navigationのモック
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

// sonnerのモック
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

// usersモジュールのモック
vi.mock("@/api/users", () => ({
  getGetUsersIdPostsQueryKey: vi.fn((id: number) => [`/users/${id}/posts`]),
}));

describe("useDeletePost", () => {
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
});
