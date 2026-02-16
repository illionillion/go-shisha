import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ImageUploader } from "./ImageUploader";

// モックファイル作成ヘルパー
const createMockFile = (name: string, size: number, type: string): File => {
  const blob = new Blob(["a".repeat(size)], { type });
  return new File([blob], name, { type });
};

describe("ImageUploader", () => {
  describe("レンダリング", () => {
    it("デフォルトUIが表示される", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      expect(screen.getByText(/クリックまたはドラッグ&ドロップで画像を選択/)).toBeInTheDocument();
      expect(screen.getByText(/JPG、PNG、WebP、GIF/)).toBeInTheDocument();
    });

    it("ファイル選択inputが存在する", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const input = screen.getByLabelText("画像ファイルを選択");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "file");
      expect(input).toHaveAttribute("multiple");
    });

    it("カスタムmaxFilesが表示される", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxFiles={5} />);

      expect(screen.getByText(/最大5枚/)).toBeInTheDocument();
    });

    it("カスタムmaxSizeMBが表示される", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxSizeMB={5} />);

      expect(screen.getByText(/5MB以下/)).toBeInTheDocument();
    });
  });

  describe("ファイル選択", () => {
    it("ファイルを選択するとonFilesSelectedが呼ばれる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg"); // 1MB
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
      });
    });

    it("複数ファイルを選択できる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file1 = createMockFile("test1.jpg", 1024 * 1024, "image/jpeg");
      const file2 = createMockFile("test2.png", 1024 * 1024, "image/png");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, [file1, file2]);

      await waitFor(() => {
        expect(mockOnFilesSelected).toHaveBeenCalledWith([file1, file2]);
      });
    });

    it("同じファイルを再選択できる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);
      await userEvent.upload(input, file);

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(2);
    });
  });

  describe("バリデーション", () => {
    it("ファイル数超過時にエラーが表示される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxFiles={2} />);

      const files = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test3.jpg", 1024 * 1024, "image/jpeg"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("最大2枚まで選択できます");
      });
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it("ファイルサイズ超過時にエラーが表示される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxSizeMB={1} />);

      const file = createMockFile("large.jpg", 2 * 1024 * 1024, "image/jpeg"); // 2MB
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "ファイルサイズは1MB以下にしてください"
        );
      });
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it("サポートされていないファイル形式でエラーが表示される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.pdf", 1024 * 1024, "application/pdf");
      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;

      const dataTransfer = {
        files: [file],
        types: ["Files"],
      };

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "JPG、PNG、WebP、GIF形式の画像を選択してください"
        );
      });
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it("カスタム受け入れ形式を設定できる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(
        <ImageUploader
          onFilesSelected={mockOnFilesSelected}
          acceptedFormats={["image/jpeg", "image/png"]}
        />
      );

      const file = createMockFile("test.gif", 1024 * 1024, "image/gif");
      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;

      const dataTransfer = {
        files: [file],
        types: ["Files"],
      };

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "JPG、PNG、WebP、GIF形式の画像を選択してください"
        );
      });
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });
  });

  describe("ドラッグ&ドロップ", () => {
    it("ドラッグオーバー時にスタイルが変わる", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;

      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass("border-blue-500", "bg-blue-50");

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass("border-blue-500");
    });

    it("ドロップ時にonFilesSelectedが呼ばれる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;

      const dataTransfer = {
        files: [file],
        types: ["Files"],
      };

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
      });
    });

    it("ドロップ後にドラッグ状態が解除される", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;

      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass("border-blue-500");

      const dataTransfer = {
        files: [file],
        types: ["Files"],
      };

      fireEvent.drop(dropZone, { dataTransfer });
      expect(dropZone).not.toHaveClass("border-blue-500");
    });
  });

  describe("無効状態", () => {
    it("disabled時はファイル選択できない", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} disabled />);

      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it("disabled時はドラッグ&ドロップできない", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} disabled />);

      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;

      fireEvent.dragEnter(dropZone);
      expect(dropZone).not.toHaveClass("border-blue-500");
    });

    it("disabled時は無効化スタイルが適用される", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} disabled />);

      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;
      expect(dropZone).toHaveClass("cursor-not-allowed", "opacity-50");
    });
  });

  describe("アクセシビリティ", () => {
    it("エラーメッセージにrole=alertが設定される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxFiles={1} />);

      const files = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.jpg", 1024 * 1024, "image/jpeg"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files);

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();
      });
    });

    it("ファイルinputにaria-labelが設定される", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const input = screen.getByLabelText("画像ファイルを選択");
      expect(input).toBeInTheDocument();
    });
  });
});
