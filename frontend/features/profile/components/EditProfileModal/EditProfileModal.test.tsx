import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@/test/utils";
import type { UpdateUserInput } from "@/types/domain";
import * as uploadsModule from "@/api/uploads";
import * as useUpdateProfileModule from "../../hooks/useUpdateProfile";
import { EditProfileModal } from "./EditProfileModal";

// focus-trap-react をモック（子要素をそのままレンダリング）
vi.mock("focus-trap-react", () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// useUpdateProfile をモック
vi.mock("../../hooks/useUpdateProfile");

// usePostUploadsProfileImages をモック
vi.mock("@/api/uploads");

/** テスト用ユーザー初期値 */
const mockInitialUser = {
  display_name: "テストユーザー",
  description: "自己紹介文",
  external_url: "https://example.com",
  icon_url: "",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditProfileModal", () => {
  let mockOnUpdate: ReturnType<typeof vi.fn<(input: UpdateUserInput) => void>>;
  let mockMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpdate = vi.fn();
    mockMutateAsync = vi.fn().mockResolvedValue({
      status: 200,
      data: { url: "https://example.com/avatar.png" },
    });
    vi.mocked(useUpdateProfileModule.useUpdateProfile).mockReturnValue({
      onUpdate: mockOnUpdate,
      isPending: false,
    });
    vi.mocked(uploadsModule.usePostUploadsProfileImages).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof uploadsModule.usePostUploadsProfileImages>);
  });

  describe("基本的なレンダリング", () => {
    it("dialog roleで表示される", () => {
      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("モーダルの aria-label が 'プロフィール編集' である", () => {
      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "プロフィール編集");
    });

    it("既存の表示名がプリセットされている", () => {
      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const input = screen.getByLabelText("表示名");
      expect(input).toHaveValue("テストユーザー");
    });

    it("既存の自己紹介がプリセットされている", () => {
      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const textarea = screen.getByLabelText("自己紹介");
      expect(textarea).toHaveValue("自己紹介文");
    });

    it("アバター画像変更ボタンが表示される", () => {
      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByLabelText("プロフィール画像を変更")).toBeInTheDocument();
    });

    it("icon_url の手入力フィールドは表示されない", () => {
      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.queryByLabelText("アイコン画像URL")).not.toBeInTheDocument();
    });
  });

  describe("ESCキーとバックドロップ", () => {
    it("ESCキーでonCancelが呼ばれる", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={onCancel}
        />
      );

      await user.keyboard("{Escape}");

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("バックドロップクリックでonCancelが呼ばれる", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      const { container } = render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={onCancel}
        />
      );

      const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      await user.click(backdrop);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("isPendingがtrueのとき、ESCキーでonCancelが呼ばれない", async () => {
      vi.mocked(useUpdateProfileModule.useUpdateProfile).mockReturnValue({
        onUpdate: mockOnUpdate,
        isPending: true,
      });

      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={onCancel}
        />
      );

      await user.keyboard("{Escape}");

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("フォーム送信", () => {
    it("保存ボタンをクリックするとonUpdateが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: "テストユーザー",
          description: "自己紹介文",
          external_url: "https://example.com",
        })
      );
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンをクリックするとonCancelが呼ばれる", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("アバター画像アップロード", () => {
    it("ファイル選択後にアップロードAPIが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const fileInput = screen.getByLabelText("プロフィール画像ファイル選択");
      const file = new File(["dummy"], "avatar.png", { type: "image/png" });
      await user.upload(fileInput, file);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        data: { image: file },
      });
    });

    it("アップロード失敗時にエラーメッセージが表示される", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error("upload failed"));
      vi.mocked(uploadsModule.usePostUploadsProfileImages).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: true,
      } as unknown as ReturnType<typeof uploadsModule.usePostUploadsProfileImages>);

      render(
        <EditProfileModal
          userId={1}
          initialUser={mockInitialUser}
          onClose={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const fileInput = screen.getByLabelText("プロフィール画像ファイル選択");
      const file = new File(["dummy"], "avatar.png", { type: "image/png" });
      await user.upload(fileInput, file);

      expect(screen.getByText("画像のアップロードに失敗しました")).toBeInTheDocument();
    });
  });
});
