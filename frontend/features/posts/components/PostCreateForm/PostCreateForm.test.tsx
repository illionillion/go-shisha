import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { Flavor } from "@/types/domain";
import { PostCreateForm } from "./PostCreateForm";

// モックフレーバーデータ
const mockFlavors: Flavor[] = [
  { id: 1, name: "ミント", color: "#00D9FF" },
  { id: 2, name: "アップル", color: "#80FF00" },
];

// モックファイル作成ヘルパー
const createMockFile = (name: string, size: number, type: string): File => {
  const blob = new Blob(["a".repeat(size)], { type });
  return new File([blob], name, { type });
};

describe("PostCreateForm", () => {
  describe("レンダリング", () => {
    it("初期表示で画像選択ステップが表示される", () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("投稿を作成")).toBeInTheDocument();
      expect(screen.getByText(/クリックまたはドラッグ&ドロップで画像を選択/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "次へ" })).toBeInTheDocument();
    });

    it("閉じるボタンが表示される", () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();
      render(
        <PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
    });
  });

  describe("画像選択ステップ", () => {
    it("画像未選択時は「次へ」ボタンが無効", () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const nextButton = screen.getByRole("button", { name: "次へ" });
      expect(nextButton).toBeDisabled();
    });

    it("画像選択後に選択枚数が表示される", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText("1枚選択中")).toBeInTheDocument();
      });
    });

    it("画像選択後に「次へ」ボタンが有効になる", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        const nextButton = screen.getByRole("button", { name: "次へ" });
        expect(nextButton).not.toBeDisabled();
      });
    });
  });

  describe("編集ステップ", () => {
    it("「次へ」ボタンクリックで編集ステップに移動する", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        const nextButton = screen.getByRole("button", { name: "次へ" });
        expect(nextButton).not.toBeDisabled();
      });

      const nextButton = screen.getByRole("button", { name: "次へ" });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("画像 1 / 1")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "投稿する" })).toBeInTheDocument();
      });
    });

    it("編集ステップでフレーバー選択UIが表示される", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);
      await waitFor(() => screen.getByRole("button", { name: "次へ" }));
      await userEvent.click(screen.getByRole("button", { name: "次へ" }));

      await waitFor(() => {
        expect(screen.getByText("フレーバー（オプション）")).toBeInTheDocument();
      });
    });

    it("編集ステップで説明入力UIが表示される", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);
      await waitFor(() => screen.getByRole("button", { name: "次へ" }));
      await userEvent.click(screen.getByRole("button", { name: "次へ" }));

      await waitFor(() => {
        expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
        expect(screen.getByText("0 / 100文字")).toBeInTheDocument();
      });
    });

    it("「戻る」ボタンで画像選択ステップに戻る", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);
      await waitFor(() => screen.getByRole("button", { name: "次へ" }));
      await userEvent.click(screen.getByRole("button", { name: "次へ" }));

      await waitFor(() => screen.getByRole("button", { name: "戻る" }));
      await userEvent.click(screen.getByRole("button", { name: "戻る" }));

      await waitFor(() => {
        expect(screen.getByText(/クリックまたはドラッグ&ドロップで画像を選択/)).toBeInTheDocument();
      });
    });
  });

  describe("複数画像の編集", () => {
    it("複数画像選択時にカルーセルで移動できる", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const files = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.jpg", 1024 * 1024, "image/jpeg"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files);
      await waitFor(() => screen.getByText("2枚選択中"));
      await userEvent.click(screen.getByRole("button", { name: "次へ" }));

      await waitFor(() => {
        expect(screen.getByText("画像 1 / 2")).toBeInTheDocument();
      });

      // 次の画像へ
      const nextSlideButton = screen.getByRole("button", { name: "次 →" });
      await userEvent.click(nextSlideButton);

      await waitFor(() => {
        expect(screen.getByText("画像 2 / 2")).toBeInTheDocument();
      });

      // 前の画像へ
      const prevSlideButton = screen.getByRole("button", { name: "← 前" });
      await userEvent.click(prevSlideButton);

      await waitFor(() => {
        expect(screen.getByText("画像 1 / 2")).toBeInTheDocument();
      });
    });
  });

  describe("投稿", () => {
    it("「投稿する」ボタンクリックでonSubmitが呼ばれる", async () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);
      await waitFor(() => screen.getByRole("button", { name: "次へ" }));
      await userEvent.click(screen.getByRole("button", { name: "次へ" }));

      await waitFor(() => screen.getByRole("button", { name: "投稿する" }));
      await userEvent.click(screen.getByRole("button", { name: "投稿する" }));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            file: expect.any(File),
            previewUrl: expect.stringContaining("blob:"),
            description: "",
          }),
        ])
      );
    });
  });

  describe("無効状態", () => {
    it("disabled時は全ボタンが無効化される", () => {
      const mockOnSubmit = vi.fn();
      render(<PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} disabled />);

      expect(screen.getByRole("button", { name: "閉じる" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });
  });

  describe("キャンセル", () => {
    it("「閉じる」ボタンクリックでonCancelが呼ばれる", async () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();
      render(
        <PostCreateForm flavors={mockFlavors} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await userEvent.click(screen.getByRole("button", { name: "閉じる" }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
