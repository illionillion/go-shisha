import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@/types/domain";
import { useAuthStore } from "../stores/authStore";
import { LoginPageClient } from "./LoginPageClient";

// モックの設定
const mockReplace = vi.fn();
const mockSearchParams = {
  get: vi.fn((_key: string): string | null => null),
};
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("../api/authApi", () => ({
  authApi: {
    login: vi.fn(),
  },
}));

const mockUser: User = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "https://example.com/icon.png",
  description: "テスト用ユーザー",
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("LoginPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReplace.mockClear();
    useAuthStore.setState({ user: null });
  });

  describe("レンダリング", () => {
    it("フォームが表示される", () => {
      render(<LoginPageClient />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ログイン/i })).toBeInTheDocument();
    });

    it("新規登録リンクが表示される", () => {
      render(<LoginPageClient />, { wrapper: createWrapper() });

      const registerLink = screen.getByRole("link", { name: /こちら/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("フォーム送信", () => {
    it("正しい情報でログインが成功する", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../api/authApi");
      const mockLogin = vi.fn().mockResolvedValue({ user: mockUser });
      vi.mocked(authApi.login).mockImplementation(mockLogin);

      render(<LoginPageClient />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "Password123!",
        });
      });

      // ストアにユーザー情報が設定される
      expect(useAuthStore.getState().user).toEqual(mockUser);

      // ホームページにリダイレクト
      expect(mockReplace).toHaveBeenCalledWith("/");
    });

    it("エラー時にエラーメッセージが表示される", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../api/authApi");
      const mockLogin = vi.fn().mockRejectedValue({
        status: 401,
        error: "メールアドレスまたはパスワードが正しくありません",
      });
      vi.mocked(authApi.login).mockImplementation(mockLogin);

      render(<LoginPageClient />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "WrongPassword123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/メールアドレスまたはパスワードが正しくありません/i)
        ).toBeInTheDocument();
      });

      // ストアは更新されない
      expect(useAuthStore.getState().user).toBeNull();

      // リダイレクトされない
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("送信中はボタンが無効化される", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../api/authApi");
      let resolveLogin: (value: { user: User }) => void;
      const mockLogin = vi.fn().mockImplementation(
        () =>
          new Promise<{ user: User }>((resolve) => {
            resolveLogin = resolve;
          })
      );
      vi.mocked(authApi.login).mockImplementation(mockLogin);

      render(<LoginPageClient />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.click(submitButton);

      // 送信中はボタンが無効化
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // 送信完了
      resolveLogin!({ user: mockUser });

      // ボタンが有効化
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("バリデーション", () => {
    it("メールアドレスが空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      render(<LoginPageClient />, { wrapper: createWrapper() });

      const passwordInput = screen.getByLabelText(/パスワード/i);
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/メールアドレスを入力してください/i)).toBeInTheDocument();
      });
    });

    it("パスワードが空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      render(<LoginPageClient />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/パスワードを入力してください/i)).toBeInTheDocument();
      });
    });
  });

  describe("redirectUrl機能", () => {
    it("redirectUrlパラメータがある場合、ログイン成功後にAPIを呼び出して復号化されたパスへリダイレクトする", async () => {
      const { authApi } = await import("../api/authApi");
      const user = userEvent.setup();

      // redirectUrlパラメータをモック
      mockSearchParams.get.mockImplementation((key: string) =>
        key === "redirectUrl" ? "encrypted-token-123" : null
      );

      // APIレスポンスをモック
      vi.mocked(authApi.login).mockResolvedValue({ user: mockUser });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ path: "/posts/123" }),
      });

      render(<LoginPageClient />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("/api/resolve-redirect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: "encrypted-token-123" }),
        });
        expect(mockReplace).toHaveBeenCalledWith("/posts/123");
      });
    });

    it("redirectUrlパラメータがある場合、登録リンクにredirectUrlが引き継がれる", () => {
      mockSearchParams.get.mockImplementation((key: string) =>
        key === "redirectUrl" ? "encrypted-token-456" : null
      );

      render(<LoginPageClient />, { wrapper: createWrapper() });

      const registerLink = screen.getByRole("link", { name: /こちら/i });
      expect(registerLink).toHaveAttribute("href", "/register?redirectUrl=encrypted-token-456");
    });

    it("API呼び出しが失敗した場合、デフォルトの/へリダイレクトする", async () => {
      const { authApi } = await import("../api/authApi");
      const user = userEvent.setup();

      mockSearchParams.get.mockImplementation((key: string) =>
        key === "redirectUrl" ? "invalid-token" : null
      );

      vi.mocked(authApi.login).mockResolvedValue({ user: mockUser });
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      render(<LoginPageClient />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/");
      });
    });
  });
});
