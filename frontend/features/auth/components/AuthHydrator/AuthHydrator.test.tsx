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

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null });
  });

  const renderWithClient = (client: QueryClient) => {
    return render(
      <QueryClientProvider client={client}>
        <AuthHydrator />
      </QueryClientProvider>
    );
  };

  it("API成功時にユーザー情報をストアに設定する", async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 5 * 60 * 1000,
        },
      },
    });

    vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
      queryKey: ["auth", "me"],
      queryFn: async () => ({ user: mockUser }),
    } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

    renderWithClient(queryClient);

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });
  });

  it("コンポーネントは何もレンダリングしない（nullを返す）", async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 5 * 60 * 1000,
        },
      },
    });

    vi.mocked(getGetAuthMeQueryOptions).mockReturnValue({
      queryKey: ["auth", "me"],
      queryFn: async () => ({ user: mockUser }),
    } as unknown as ReturnType<typeof getGetAuthMeQueryOptions>);

    const { container } = renderWithClient(queryClient);
    expect(container.firstChild).toBeNull();
  });
});
