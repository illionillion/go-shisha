import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@/types/domain";
import { useAuthStore } from "../../stores/authStore";
import { UserMenu } from "./UserMenu";

// モックの設定
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("../../api/authApi", () => ({
  authApi: {
    logout: vi.fn(),
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

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().reset();
  });

  describe("ハイドレーション中（isLoading: true）", () => {
    it("DefaultAvatarが表示される", () => {
      // 初期状態は isLoading: true なのでそのまま
      render(<UserMenu />, { wrapper: createWrapper() });

      // DefaultAvatar が表示されている
      const avatar = screen.getByRole("img", { hidden: true });
      expect(avatar).toBeInTheDocument();
    });

    it("ログインボタンは表示されない", () => {
      render(<UserMenu />, { wrapper: createWrapper() });

      expect(screen.queryByRole("link", { name: /ログイン/i })).not.toBeInTheDocument();
    });

    it("ユーザーアバターボタンは表示されない", () => {
      render(<UserMenu />, { wrapper: createWrapper() });

      expect(screen.queryByRole("button", { name: /メニュー/i })).not.toBeInTheDocument();
    });
  });

  describe("未ログイン時", () => {
    beforeEach(() => {
      useAuthStore.setState({ user: null, isLoading: false });
    });

    it("ログインボタンが表示される", () => {
      render(<UserMenu />, { wrapper: createWrapper() });

      const loginButton = screen.getByRole("link", { name: /ログイン/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute("href", "/login");
    });

    it("アバターは表示されない", () => {
      render(<UserMenu />, { wrapper: createWrapper() });

      expect(screen.queryByRole("button", { name: /メニュー/i })).not.toBeInTheDocument();
    });
  });

  describe("ログイン済み時", () => {
    beforeEach(() => {
      useAuthStore.setState({ user: mockUser, isLoading: false });
    });

    it("アバターが表示される", () => {
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      expect(avatar).toBeInTheDocument();
    });

    it("アバターボタンに適切なaria属性が設定されている", () => {
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      expect(avatar).toHaveAttribute("aria-haspopup", "true");
      expect(avatar).toHaveAttribute("aria-expanded", "false");
    });

    it("ログインボタンは表示されない", () => {
      render(<UserMenu />, { wrapper: createWrapper() });

      expect(screen.queryByRole("link", { name: /ログイン/i })).not.toBeInTheDocument();
    });

    it("アバタークリックでドロップダウンメニューが開く", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByText(/プロフィール/i)).toBeInTheDocument();
        expect(screen.getByText(/ログアウト/i)).toBeInTheDocument();
        expect(avatar).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("もう一度クリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });

      // 開く
      await user.click(avatar);
      await waitFor(() => {
        expect(screen.getByText(/ログアウト/i)).toBeInTheDocument();
      });

      // 閉じる
      await user.click(avatar);
      await waitFor(() => {
        expect(screen.queryByText(/ログアウト/i)).not.toBeInTheDocument();
      });
    });

    it("プロフィールリンクが正しく設定されている", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      const profileLink = await screen.findByText(/プロフィール/i);
      expect(profileLink).toHaveAttribute("href", `/profile/${mockUser.id}`);
    });

    it("ログアウトボタンをクリックするとログアウト処理が実行される", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../../api/authApi");
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      vi.mocked(authApi.logout).mockImplementation(mockLogout);

      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      const logoutButton = await screen.findByText(/ログアウト/i);
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it("メニュー外をクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <UserMenu />
        </div>,
        { wrapper: createWrapper() }
      );

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByText(/ログアウト/i)).toBeInTheDocument();
      });

      // 外側をクリック
      const outside = screen.getByTestId("outside");
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByText(/ログアウト/i)).not.toBeInTheDocument();
      });
    });

    it("ドロップダウンメニューに適切なrole属性が設定されている", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      const menu = await screen.findByRole("menu");
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveAttribute("aria-orientation", "vertical");
    });

    it("メニュー項目にrole='menuitem'が設定されている", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      const menuItems = await screen.findAllByRole("menuitem");
      expect(menuItems).toHaveLength(2); // プロフィールとログアウト
    });

    it("Escキーを押すとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByText(/ログアウト/i)).toBeInTheDocument();
      });

      // Escキーを押す
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByText(/ログアウト/i)).not.toBeInTheDocument();
        expect(avatar).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("プロフィールリンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByText(/プロフィール/i)).toBeInTheDocument();
      });

      // プロフィールリンクをクリック
      const profileLink = screen.getByText(/プロフィール/i);
      await user.click(profileLink);

      // メニューが閉じる
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    it("Escape以外のキーを押してもメニューが閉じない", async () => {
      const user = userEvent.setup();
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByText(/ログアウト/i)).toBeInTheDocument();
      });

      // Escape以外のキー（a）を押す
      await user.keyboard("a");

      // メニューは閉じない
      expect(screen.getByText(/ログアウト/i)).toBeInTheDocument();
    });

    it("display_nameが空のユーザーでもアバターが表示される", () => {
      useAuthStore.setState({ user: { ...mockUser, display_name: "" }, isLoading: false });
      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      expect(avatar).toBeInTheDocument();
    });

    it("ログアウト中はメニューを再度開くとボタンが「ログアウト中...」表示かつdisabledになる", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../../api/authApi");
      let resolveLogout: () => void;
      const mockLogout = vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveLogout = resolve;
          })
      );
      vi.mocked(authApi.logout).mockImplementation(mockLogout);

      render(<UserMenu />, { wrapper: createWrapper() });

      // メニューを開く
      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      // ログアウトボタンをクリック（メニューが閉じてmutationが開始）
      const logoutButton = await screen.findByText(/^ログアウト$/i);
      await user.click(logoutButton);

      // mutationが開始されたことを確認
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });

      // メニューを再度開く（mutationが進行中）
      await user.click(avatar);

      // ログアウト中の表示・disabled状態を確認
      await waitFor(() => {
        expect(screen.getByText(/ログアウト中\.\.\./i)).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /ログアウト中\.\.\./i })).toBeDisabled();
      });

      // 完了
      resolveLogout!();
    });

    it("ログアウトに失敗した場合はアラートが表示される", async () => {
      const user = userEvent.setup();
      const { authApi } = await import("../../api/authApi");
      const mockLogout = vi.fn().mockRejectedValue(new Error("Logout failed"));
      vi.mocked(authApi.logout).mockImplementation(mockLogout);

      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<UserMenu />, { wrapper: createWrapper() });

      const avatar = screen.getByRole("button", { name: /メニュー/i });
      await user.click(avatar);

      const logoutButton = await screen.findByText(/ログアウト/i);
      await user.click(logoutButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          "ログアウトに失敗しました。時間をおいて再度お試しください。"
        );
      });

      alertMock.mockRestore();
    });
  });
});
