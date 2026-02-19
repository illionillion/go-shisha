import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGetAuthMeQueryOptions } from "@/api/auth";
import { useAuthStore } from "../../stores/authStore";
import { AuthHydrator } from "./AuthHydrator";

// モックの設定
vi.mock("@/api/auth", () => ({
  getGetAuthMeQueryOptions: vi.fn(),
}));

// usePathname のモックを動的に制御できるようにする
const mockUsePathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), prefetch: vi.fn(), back: vi.fn() })),
  usePathname: () => mockUsePathname(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

const mockUser = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "https://example.com/icon.png",
  description: "テスト用ユーザー",
  external_url: "",
};

describe("AuthHydrator", () => {
  let queryClient: QueryClient;

  /**
   * テスト用 QueryClient 生成ヘルパー
   * - retry: 0 でリトライを無効化し、テストの高速化と予測可能性を向上
   * - staleTime は本番環境と同じ設定を使用
   */
  const createTestQueryClient = () => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: 0,
          staleTime: 5 * 60 * 1000,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // ストアを初期状態にリセット（isLoading: true, user: null）
    useAuthStore.getState().reset();
    // デフォルトのパスは "/" にリセット
    mockUsePathname.mockReturnValue("/");
  });

  const renderWithClient = (client: QueryClient) => {
    return render(
      <QueryClientProvider client={client}>
        <AuthHydrator />
      </QueryClientProvider>
    );
  };

  it("API成功時にユーザー情報をストアに設定する", async () => {
    queryClient = createTestQueryClient();

    // Orval 8.x形式: { data: { user }, status: 200, headers }
    vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
      queryKey: ["auth", "me"],
      queryFn: async () => ({
        data: { user: mockUser },
        status: 200,
        headers: new Headers(),
      }),
    } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

    renderWithClient(queryClient);

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });
  });

  it("コンポーネントは何もレンダリングしない（nullを返す）", async () => {
    queryClient = createTestQueryClient();

    vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
      queryKey: ["auth", "me"],
      queryFn: async () => ({
        data: { user: mockUser },
        status: 200,
        headers: new Headers(),
      }),
    } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

    const { container } = renderWithClient(queryClient);
    expect(container.firstChild).toBeNull();
  });

  it("500エラー時はユーザー情報を保持する", async () => {
    // 初期状態でユーザーをセット
    useAuthStore.setState({ user: mockUser });

    queryClient = createTestQueryClient();

    vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
      queryKey: ["auth", "me"],
      queryFn: async () => {
        const error = Object.assign(new Error("Internal Server Error"), {
          status: 500,
          statusText: "Internal Server Error",
        });
        throw error;
      },
    } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

    renderWithClient(queryClient);

    // 少し待ってもユーザー情報は保持される
    await new Promise((resolve) => setTimeout(resolve, 100));
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  describe("isLoading 状態遷移", () => {
    it("成功時（ユーザーあり）: isLoading が false になる", async () => {
      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => ({
          data: { user: mockUser },
          status: 200,
          headers: new Headers(),
        }),
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isLoading).toBe(false);
      });
    });

    it("成功時（user が null）: isLoading が false になる", async () => {
      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => ({
          data: { user: null },
          status: 200,
          headers: new Headers(),
        }),
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isLoading).toBe(false);
      });
    });

    it("成功時（user キー欠落）: isLoading が false になり user は null に正規化される", async () => {
      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => ({
          data: {}, // user キーが欠落している場合
          status: 200,
          headers: new Headers(),
        }),
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull(); // undefined ではなく null に正規化される
        expect(state.isLoading).toBe(false);
      });
    });

    it("401 エラー時: isLoading が false になる", async () => {
      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => {
          const error = Object.assign(new Error("Unauthorized"), {
            status: 401,
            statusText: "Unauthorized",
          });
          throw error;
        },
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isLoading).toBe(false);
      });
    });

    it("スキップパス（/login）時: isLoading が即座に false になる", async () => {
      // /login パスに設定
      mockUsePathname.mockReturnValue("/login");

      queryClient = createTestQueryClient();

      // enabled: false のためクエリは実行されないが、一貫性のため queryOptions を設定
      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => ({
          data: { user: mockUser },
          status: 200,
          headers: new Headers(),
        }),
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      // スキップパスでは即座に isLoading が false になる
      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.isLoading).toBe(false);
      });

      // クエリが実行されないため、user は null のまま
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it("500 エラー時: isLoading が false になる", async () => {
      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => {
          const error = Object.assign(new Error("Internal Server Error"), {
            status: 500,
            statusText: "Internal Server Error",
          });
          throw error;
        },
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.isLoading).toBe(false);
      });
    });

    it("isError=true かつ error が falsy の場合: isLoading が false になる", async () => {
      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],

        queryFn: async () => {
          throw null; // error が null になる（falsy）
        },
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.isLoading).toBe(false);
      });
    });

    it("pathname が null の場合: スキップしない（通常のパスとして扱われる）", async () => {
      mockUsePathname.mockReturnValue(null as unknown as string);

      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => ({
          data: { user: mockUser },
          status: 200,
          headers: new Headers(),
        }),
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isLoading).toBe(false);
      });
    });

    it("クエリが非2xxレスポンスを返した場合（エラーなし）: ローディング状態は変化しない", async () => {
      queryClient = createTestQueryClient();

      vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
        queryKey: ["auth", "me"],
        queryFn: async () => ({
          data: {},
          status: 400,
          headers: new Headers(),
        }),
      } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

      renderWithClient(queryClient);

      // 非2xxレスポンスかつisErrorがfalseの場合、条件に一致せずローディング状態が変化しない
      await new Promise((resolve) => setTimeout(resolve, 100));
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });
});
