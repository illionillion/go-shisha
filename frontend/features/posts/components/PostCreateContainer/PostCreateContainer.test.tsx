import { act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { render, screen } from "@/test/utils";
import type { User } from "@/types/domain";
import { PostCreateContainer } from "./PostCreateContainer";

// フックをモック
vi.mock("../../hooks/useGetFlavors", () => ({
  useGetFlavors: vi.fn(() => ({
    data: { status: 200, data: [{ id: 1, name: "ミント", color: "bg-green-500" }] },
    isError: false,
  })),
  getFlavorsData: vi.fn(() => [{ id: 1, name: "ミント", color: "bg-green-500" }]),
}));

vi.mock("../../hooks/useUploadImages", () => ({
  useUploadImages: vi.fn(
    (_opts?: { onSuccess?: (urls: string[]) => void; onError?: (msg: string) => void }) => ({
      uploadImages: vi.fn(),
      isPending: false,
    })
  ),
}));

vi.mock("../../hooks/useCreatePost", () => ({
  useCreatePost: vi.fn(
    (_opts?: { onSuccess?: (post: unknown) => void; onError?: (msg: string) => void }) => ({
      createPost: vi.fn(),
      isPending: false,
    })
  ),
}));

// next/navigation をモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockUser: User = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "",
  description: "テスト",
};

afterEach(() => {
  cleanup();
  useAuthStore.getState().reset();
  vi.clearAllMocks();
});

describe("PostCreateContainer", () => {
  describe("認証状態によるFAB表示制御", () => {
    it("ログイン済みの場合はFABが表示される", () => {
      useAuthStore.setState({ user: mockUser, isLoading: false });
      render(<PostCreateContainer />);

      expect(screen.getByRole("button", { name: "投稿作成" })).toBeInTheDocument();
    });

    it("未ログインの場合はFABが表示されない", () => {
      useAuthStore.setState({ user: null, isLoading: false });
      render(<PostCreateContainer />);

      expect(screen.queryByRole("button", { name: "投稿作成" })).not.toBeInTheDocument();
    });
  });

  describe("モーダル開閉", () => {
    beforeEach(() => {
      useAuthStore.setState({ user: mockUser, isLoading: false });
    });

    it("FABクリックでモーダルが開く", async () => {
      const user = userEvent.setup();
      render(<PostCreateContainer />);

      await user.click(screen.getByRole("button", { name: "投稿作成" }));

      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();
    });

    it("モーダルが開くと投稿作成ダイアログが表示される", async () => {
      const user = userEvent.setup();
      render(<PostCreateContainer />);

      await user.click(screen.getByRole("button", { name: "投稿作成" }));

      expect(screen.getByText("投稿を作成")).toBeInTheDocument();
    });

    it("バックドロップクリックでモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<PostCreateContainer />);

      // モーダルを開く
      await user.click(screen.getByRole("button", { name: "投稿作成" }));
      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();

      // バックドロップをクリック（直接DOMクリックなactでラップガ必要）
      const backdrop = screen.getByTestId("post-create-backdrop");
      await act(async () => {
        backdrop.click();
      });

      expect(screen.queryByRole("dialog", { name: "投稿作成" })).not.toBeInTheDocument();
    });

    it("閉じるボタンでモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<PostCreateContainer />);

      await user.click(screen.getByRole("button", { name: "投稿作成" }));
      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "閉じる" }));

      expect(screen.queryByRole("dialog", { name: "投稿作成" })).not.toBeInTheDocument();
    });
  });
});
