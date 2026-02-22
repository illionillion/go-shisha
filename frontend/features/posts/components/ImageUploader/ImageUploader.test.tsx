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

      expect(screen.getByText(/あと5枚/)).toBeInTheDocument();
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

    it("dragOverイベントのデフォルト動作が防止される", () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const dropZone = screen
        .getByText(/クリックまたはドラッグ&ドロップで画像を選択/)
        .closest("div") as HTMLElement;

      const dragOverEvent = new Event("dragover", { bubbles: true });
      const preventDefaultSpy = vi.spyOn(dragOverEvent, "preventDefault");
      const stopPropagationSpy = vi.spyOn(dragOverEvent, "stopPropagation");

      dropZone.dispatchEvent(dragOverEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
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

  describe("プレビュー表示", () => {
    it("ファイル選択後にプレビューが表示される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/選択中の画像/)).toBeInTheDocument();
        expect(screen.getByText("test.jpg")).toBeInTheDocument();
        expect(screen.getByAltText("プレビュー 1")).toBeInTheDocument();
      });
    });

    it("複数ファイルのプレビューが表示される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const files = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.png", 2 * 1024 * 1024, "image/png"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files);

      await waitFor(() => {
        expect(screen.getByText("test1.jpg")).toBeInTheDocument();
        expect(screen.getByText("test2.png")).toBeInTheDocument();
        expect(screen.getByText(/選択中の画像 \(2\/10枚\)/)).toBeInTheDocument();
      });
    });

    it("value propsで初期プレビューが表示される", () => {
      const mockOnFilesSelected = vi.fn();
      const files = [createMockFile("initial.jpg", 1024 * 1024, "image/jpeg")];

      render(<ImageUploader onFilesSelected={mockOnFilesSelected} value={files} />);

      expect(screen.getByText("initial.jpg")).toBeInTheDocument();
      expect(screen.getByText(/選択中の画像 \(1\/10枚\)/)).toBeInTheDocument();
    });

    it("ファイルサイズが表示される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.jpg", 2.5 * 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/2\.50 MB/)).toBeInTheDocument();
      });
    });
  });

  describe("ファイル削除", () => {
    it("削除ボタンでファイルを削除できる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText("test.jpg")).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText("画像1を削除");
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText("test.jpg")).not.toBeInTheDocument();
        expect(mockOnFilesSelected).toHaveBeenCalledWith([]);
      });
    });

    it("複数ファイルから特定のファイルを削除できる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const files = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test3.jpg", 1024 * 1024, "image/jpeg"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files);

      await waitFor(() => {
        expect(screen.getByText("test2.jpg")).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText("画像2を削除");
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText("test2.jpg")).not.toBeInTheDocument();
        expect(screen.getByText("test1.jpg")).toBeInTheDocument();
        expect(screen.getByText("test3.jpg")).toBeInTheDocument();
      });
    });

    it("削除後にエラーがクリアされる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxFiles={1} />);

      // 2ファイル選択してエラー表示
      const files = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.jpg", 1024 * 1024, "image/jpeg"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // 1ファイルだけ選択し直す
      const singleFile = createMockFile("test.jpg", 1024 * 1024, "image/jpeg");
      await userEvent.upload(input, singleFile);

      await waitFor(() => {
        expect(screen.getByText("test.jpg")).toBeInTheDocument();
      });

      // 削除
      const deleteButton = screen.getByLabelText("画像1を削除");
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("追加アップロード", () => {
    it("プレビュー表示後も追加でファイルを選択できる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} />);

      const file1 = createMockFile("test1.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, file1);

      await waitFor(() => {
        expect(screen.getByText("test1.jpg")).toBeInTheDocument();
      });

      // 追加アップロード
      const file2 = createMockFile("test2.jpg", 1024 * 1024, "image/jpeg");
      await userEvent.upload(input, file2);

      await waitFor(() => {
        expect(screen.getByText("test1.jpg")).toBeInTheDocument();
        expect(screen.getByText("test2.jpg")).toBeInTheDocument();
        expect(screen.getByText(/選択中の画像 \(2\/10枚\)/)).toBeInTheDocument();
      });
    });

    it("上限到達時は追加アップロードUIが非表示になる", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxFiles={2} />);

      const files = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.jpg", 1024 * 1024, "image/jpeg"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files);

      await waitFor(() => {
        expect(screen.queryByText(/画像を追加/)).not.toBeInTheDocument();
        expect(screen.queryByLabelText("画像ファイルを選択")).not.toBeInTheDocument();
      });
    });

    it("既存ファイルがある状態でファイル数超過するとエラーが表示される", async () => {
      const mockOnFilesSelected = vi.fn();
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} maxFiles={3} />);

      // 最初に2ファイル選択
      const files1 = [
        createMockFile("test1.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test2.jpg", 1024 * 1024, "image/jpeg"),
      ];
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;

      await userEvent.upload(input, files1);

      await waitFor(() => {
        expect(screen.getByText("test1.jpg")).toBeInTheDocument();
      });

      // 追加で3ファイル選択（合計5ファイルで上限超過）
      const files2 = [
        createMockFile("test3.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test4.jpg", 1024 * 1024, "image/jpeg"),
        createMockFile("test5.jpg", 1024 * 1024, "image/jpeg"),
      ];

      await userEvent.upload(input, files2);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /最大3枚まで選択できます（現在2枚選択中）/
        );
      });
    });
  });

  describe("制御モード（value prop指定時）", () => {
    it("value prop指定時にドロップしてもinternalFilesを更新せずonFilesSelectedが呼ばれる", async () => {
      const mockOnFilesSelected = vi.fn();
      const initialFiles = [createMockFile("initial.jpg", 1024 * 1024, "image/jpeg")];
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} value={initialFiles} />);

      const newFile = createMockFile("new.jpg", 1024 * 1024, "image/jpeg");
      const dropZone = screen.getByText(/画像を追加/).closest("div") as HTMLElement;

      const dataTransfer = { files: [newFile], types: ["Files"] };
      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(mockOnFilesSelected).toHaveBeenCalled();
      });
    });

    it("value prop指定時にファイル入力してもinternalFilesを更新せずonFilesSelectedが呼ばれる", async () => {
      const mockOnFilesSelected = vi.fn();
      const initialFiles = [createMockFile("initial.jpg", 1024 * 1024, "image/jpeg")];
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} value={initialFiles} />);

      const newFile = createMockFile("new.jpg", 1024 * 1024, "image/jpeg");
      const input = screen.getByLabelText("画像ファイルを選択") as HTMLInputElement;
      await userEvent.upload(input, newFile);

      await waitFor(() => {
        expect(mockOnFilesSelected).toHaveBeenCalled();
      });
    });

    it("value prop指定時に削除ボタンを押してもinternalFilesを更新せずonFilesSelectedが呼ばれる", async () => {
      const mockOnFilesSelected = vi.fn();
      const initialFiles = [createMockFile("initial.jpg", 1024 * 1024, "image/jpeg")];
      render(<ImageUploader onFilesSelected={mockOnFilesSelected} value={initialFiles} />);

      const deleteButton = screen.getByLabelText("画像1を削除");
      await userEvent.click(deleteButton);

      expect(mockOnFilesSelected).toHaveBeenCalledWith([]);
    });
  });
});
