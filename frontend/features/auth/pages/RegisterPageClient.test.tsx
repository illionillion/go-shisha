import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@/types/domain";
import { useAuthStore } from "../stores/authStore";
import { RegisterPageClient } from "./RegisterPageClient";

// モックの設定
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("../api/authApi", () => ({
  authApi: {
    register: vi.fn(),
  },
}));

const mockUser: User = {
  id: 1,
  display_name: "新規ユーザー",
  email: "newuser@example.com",
  icon_url: "https://example.com/icon.png",
  description: "",
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

describe("RegisterPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null });
  });

  describe("レンダリング", () => {
    it("フォームが表示される", () => {
      render(<RegisterPageClient />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/表示名/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^パスワード$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/パスワード（確認）/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /登録/i })).toBeInTheDocument();
    });

    it("ログインリンクが表示される", () => {
      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const loginLink = screen.getByRole("link", { name: /こちら/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("フォーム送信", () => {
    it("正しい情報で登録が成功する", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../api/authApi");
      const mockRegister = vi.fn().mockResolvedValue({ user: mockUser });
      vi.mocked(authApi.register).mockImplementation(mockRegister);

      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const displayNameInput = screen.getByLabelText(/表示名/i);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/^パスワード$/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(displayNameInput, "新規ユーザー");
      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          display_name: "新規ユーザー",
          email: "newuser@example.com",
          password: "Password123!",
        });
      });

      // ログインページにリダイレクト
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("エラー時にエラーメッセージが表示される（既に登録済み）", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../api/authApi");
      const mockRegister = vi.fn().mockRejectedValue({
        status: 400,
        error: "このメールアドレスは既に登録されています",
      });
      vi.mocked(authApi.register).mockImplementation(mockRegister);

      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const displayNameInput = screen.getByLabelText(/表示名/i);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/^パスワード$/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(displayNameInput, "既存ユーザー");
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/入力値を確認してください/i)).toBeInTheDocument();
      });

      // リダイレクトされない
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("送信中はボタンが無効化される", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../api/authApi");
      let resolveRegister: (value: { user: User }) => void;
      const mockRegister = vi.fn().mockImplementation(
        () =>
          new Promise<{ user: User }>((resolve) => {
            resolveRegister = resolve;
          })
      );
      vi.mocked(authApi.register).mockImplementation(mockRegister);

      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const displayNameInput = screen.getByLabelText(/表示名/i);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/^パスワード$/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(displayNameInput, "新規ユーザー");
      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      // 送信中はボタンが無効化
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // 送信完了
      resolveRegister!({ user: mockUser });

      // ボタンが有効化
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("バリデーション", () => {
    it("表示名が空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/^パスワード$/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/表示名を入力してください/i)).toBeInTheDocument();
      });
    });

    it("メールアドレスが空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const displayNameInput = screen.getByLabelText(/表示名/i);
      const passwordInput = screen.getByLabelText(/^パスワード$/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(displayNameInput, "テストユーザー");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/メールアドレスを入力してください/i)).toBeInTheDocument();
      });
    });

    it("パスワードが空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const displayNameInput = screen.getByLabelText(/表示名/i);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(displayNameInput, "テストユーザー");
      await user.type(emailInput, "test@example.com");
      await user.type(confirmPasswordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/パスワードを入力してください/i)).toBeInTheDocument();
      });
    });

    it("パスワードが一致しない場合エラーが表示される", async () => {
      const user = userEvent.setup();
      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const displayNameInput = screen.getByLabelText(/表示名/i);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/^パスワード$/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(displayNameInput, "テストユーザー");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "DifferentPass123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/パスワードが一致しません/i)).toBeInTheDocument();
      });
    });

    it("パスワードが12文字未満の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      render(<RegisterPageClient />, { wrapper: createWrapper() });

      const displayNameInput = screen.getByLabelText(/表示名/i);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/^パスワード$/i);
      const confirmPasswordInput = screen.getByLabelText(/パスワード（確認）/i);
      const submitButton = screen.getByRole("button", { name: /登録/i });

      await user.type(displayNameInput, "テストユーザー");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Pass123!");
      await user.type(confirmPasswordInput, "Pass123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/パスワードは12文字以上である必要があります/i)).toBeInTheDocument();
      });
    });
  });
});
