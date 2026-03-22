import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@/test/utils";
import * as useUpdatePostModule from "../../hooks/useUpdatePost";
import { EditPostModal } from "./EditPostModal";

// focus-trap-react をモック（子要素をそのままレンダリング）
vi.mock("focus-trap-react", () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// useGetFlavors をモック
vi.mock("../../hooks/useGetFlavors", () => ({
  useGetFlavors: vi.fn(() => ({
    data: { status: 200, data: [{ id: 1, name: "ミント", color: "bg-green-500" }] },
    isError: false,
  })),
  getFlavorsData: vi.fn(() => [{ id: 1, name: "ミント", color: "bg-green-500" }]),
}));

// useUpdatePost をモック
vi.mock("../../hooks/useUpdatePost");

// next/image をモック
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

/** テスト用スライドデータ */
const mockSlides = [
  {
    id: 1,
    image_url: "https://example.com/image1.jpg",
    text: "既存テキスト",
    flavor: { id: 1, name: "ミント", color: "bg-green-500" },
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditPostModal", () => {
  let mockOnUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpdate = vi.fn();
    vi.mocked(useUpdatePostModule.useUpdatePost).mockReturnValue({
      onUpdate: mockOnUpdate,
      isPending: false,
    });
  });

  describe("基本的なレンダリング", () => {
    it("dialog roleで表示される", () => {
      render(<EditPostModal postId={1} slides={mockSlides} onClose={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("モーダルの aria-label が '投稿編集' である", () => {
      render(<EditPostModal postId={1} slides={mockSlides} onClose={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "投稿編集");
    });

    it("既存のテキストがプリセットされている", () => {
      render(<EditPostModal postId={1} slides={mockSlides} onClose={vi.fn()} onCancel={vi.fn()} />);

      const textarea = screen.getByPlaceholderText("この画像の説明を入力...");
      expect(textarea).toHaveValue("既存テキスト");
    });
  });

  describe("ESCキーとバックドロップ", () => {
    it("ESCキーでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<EditPostModal postId={1} slides={mockSlides} onClose={onClose} onCancel={vi.fn()} />);

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("バックドロップクリックでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { container } = render(
        <EditPostModal postId={1} slides={mockSlides} onClose={onClose} onCancel={vi.fn()} />
      );

      // aria-hidden="true" のバックドロップをクリック
      const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("isPendingがtrueのとき、ESCキーでonCloseが呼ばれない", async () => {
      vi.mocked(useUpdatePostModule.useUpdatePost).mockReturnValue({
        onUpdate: mockOnUpdate,
        isPending: true,
      });

      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<EditPostModal postId={1} slides={mockSlides} onClose={onClose} onCancel={vi.fn()} />);

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("フォーム送信", () => {
    it("保存ボタンをクリックするとonUpdateが期待するpayloadで呼ばれる", async () => {
      const user = userEvent.setup();

      render(<EditPostModal postId={1} slides={mockSlides} onClose={vi.fn()} onCancel={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(mockOnUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          slides: expect.arrayContaining([expect.objectContaining({ id: 1 })]),
        })
      );
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンをクリックするとonCancelが呼ばれる", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(
        <EditPostModal postId={1} slides={mockSlides} onClose={vi.fn()} onCancel={onCancel} />
      );

      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
