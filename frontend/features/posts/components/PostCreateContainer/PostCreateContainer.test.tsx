import { act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { render, screen } from "@/test/utils";
import type { User } from "@/types/domain";
import { useUploadImages } from "../../hooks/useUploadImages";
import { PostCreateContainer } from "./PostCreateContainer";

// focus-trap-react をモック（子要素をそのままレンダリング）
vi.mock("focus-trap-react", () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// useConfirm をモック
const mockConfirm = vi.fn();
vi.mock("@/lib/useConfirm", () => ({
  useConfirm: () => mockConfirm,
}));

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
  mockConfirm.mockReset();
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

    it("ローディング中の場合はFABが表示されない", () => {
      useAuthStore.setState({ user: mockUser, isLoading: true });
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

      // バックドロップをクリック（直接DOMクリックなのでactでラップが必要）
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

  describe("dirty状態での確認ダイアログ", () => {
    beforeEach(() => {
      useAuthStore.setState({ user: mockUser, isLoading: false });
    });

    /** ファイル選択でisDirty=trueにするヘルパー */
    async function openModalAndSelectFile() {
      const user = userEvent.setup();
      render(<PostCreateContainer />);
      await user.click(screen.getByRole("button", { name: "投稿作成" }));

      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;
      await user.upload(input, file);

      await screen.findByText("1枚選択中");
      return user;
    }

    it("dirty状態で閉じるボタンを押すとconfirmが呼ばれる", async () => {
      mockConfirm.mockResolvedValue(false);

      await openModalAndSelectFile();
      await userEvent.click(screen.getByRole("button", { name: "閉じる" }));

      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    it("dirty状態で確認ダイアログをキャンセルするとモーダルが閉じない", async () => {
      mockConfirm.mockResolvedValue(false);

      await openModalAndSelectFile();
      await userEvent.click(screen.getByRole("button", { name: "閉じる" }));

      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();
    });

    it("dirty状態で確認ダイアログをOKするとモーダルが閉じる", async () => {
      mockConfirm.mockResolvedValue(true);

      await openModalAndSelectFile();
      await userEvent.click(screen.getByRole("button", { name: "閉じる" }));

      expect(screen.queryByRole("dialog", { name: "投稿作成" })).not.toBeInTheDocument();
    });

    it("dirty状態でバックドロップをクリックするとconfirmが呼ばれる", async () => {
      mockConfirm.mockResolvedValue(false);

      await openModalAndSelectFile();
      const backdrop = screen.getByTestId("post-create-backdrop");
      await act(async () => {
        backdrop.click();
      });

      expect(mockConfirm).toHaveBeenCalledOnce();
    });
  });

  describe("アクセシビリティ機能", () => {
    beforeEach(() => {
      useAuthStore.setState({ user: mockUser, isLoading: false });
    });

    it("Escapeキーでモーダルが閉じる（dirty状態でない場合）", async () => {
      const user = userEvent.setup();
      render(<PostCreateContainer />);

      await user.click(screen.getByRole("button", { name: "投稿作成" }));
      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();

      // Escapeキーを押下
      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog", { name: "投稿作成" })).not.toBeInTheDocument();
    });

    it("Escapeキーでモーダルが閉じる（dirty状態で確認ダイアログをOKした場合）", async () => {
      mockConfirm.mockResolvedValue(true);
      const user = userEvent.setup();
      render(<PostCreateContainer />);

      await user.click(screen.getByRole("button", { name: "投稿作成" }));

      // ファイル選択でdirtyにする
      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;
      await user.upload(input, file);
      await screen.findByText("1枚選択中");

      // Escapeキーを押下
      await user.keyboard("{Escape}");

      expect(mockConfirm).toHaveBeenCalledOnce();
      expect(screen.queryByRole("dialog", { name: "投稿作成" })).not.toBeInTheDocument();
    });

    it("Escapeキーでモーダルが閉じない（dirty状態で確認ダイアログをキャンセルした場合）", async () => {
      mockConfirm.mockResolvedValue(false);
      const user = userEvent.setup();
      render(<PostCreateContainer />);

      await user.click(screen.getByRole("button", { name: "投稿作成" }));

      // ファイル選択でdirtyにする
      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;
      await user.upload(input, file);
      await screen.findByText("1枚選択中");

      // Escapeキーを押下
      await user.keyboard("{Escape}");

      expect(mockConfirm).toHaveBeenCalledOnce();
      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();
    });

    it("isSubmitting中はEscapeキーでモーダルが閉じない", async () => {
      // isUploading: true にして isSubmitting 状態を再現
      // mockReturnValueOnce だと再レンダー時に消費されるため mockReturnValue を使用
      vi.mocked(useUploadImages).mockReturnValue({
        uploadImages: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
        reset: vi.fn(),
      });

      const user = userEvent.setup();
      render(<PostCreateContainer />);

      await user.click(screen.getByRole("button", { name: "投稿作成" }));
      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();

      // isSubmitting中にEscapeキーを押下してもモーダルは閉じない
      await user.keyboard("{Escape}");

      expect(screen.getByRole("dialog", { name: "投稿作成" })).toBeInTheDocument();
      expect(mockConfirm).not.toHaveBeenCalled();

      // 他のテストへの影響を防ぐためリセット
      vi.mocked(useUploadImages).mockReset();
      vi.mocked(useUploadImages).mockImplementation((_opts?) => ({
        uploadImages: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      }));
    });
  });
});
