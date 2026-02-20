import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { EditableSlide, Flavor } from "@/types/domain";
import { SlideEditForm } from "./SlideEditForm";

const mockFlavors: Flavor[] = [
  { id: 1, name: "ミント", color: "#00D9FF" },
  { id: 2, name: "アップル", color: "#80FF00" },
];

const createMockFile = (name: string): File => {
  const blob = new Blob(["a"], { type: "image/jpeg" });
  return new File([blob], name, { type: "image/jpeg" });
};

const mockSlide: EditableSlide = {
  file: createMockFile("test.jpg"),
  previewUrl: "blob:test",
  description: "",
  flavorId: undefined,
};

describe("SlideEditForm", () => {
  describe("レンダリング", () => {
    it("スライド番号と総数が表示される", () => {
      render(
        <SlideEditForm
          slide={mockSlide}
          currentIndex={1}
          totalCount={3}
          flavors={mockFlavors}
          onUpdate={vi.fn()}
        />
      );

      expect(screen.getByText("画像 1 / 3")).toBeInTheDocument();
    });

    it("ファイル名とサイズが表示される", () => {
      render(
        <SlideEditForm
          slide={mockSlide}
          currentIndex={1}
          totalCount={1}
          flavors={mockFlavors}
          onUpdate={vi.fn()}
        />
      );

      expect(screen.getByText(/ファイル名: test\.jpg/)).toBeInTheDocument();
    });
  });

  describe("フレーバー変更", () => {
    it("フレーバーを選択するとonUpdateが呼ばれる", async () => {
      const onUpdate = vi.fn();
      render(
        <SlideEditForm
          slide={mockSlide}
          currentIndex={1}
          totalCount={1}
          flavors={mockFlavors}
          onUpdate={onUpdate}
        />
      );

      const select = screen.getByRole("combobox");
      await userEvent.selectOptions(select, "1");

      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ flavorId: 1 }));
    });
  });

  describe("説明入力", () => {
    it("説明を入力するとonUpdateが呼ばれる", async () => {
      const onUpdate = vi.fn();
      render(
        <SlideEditForm
          slide={mockSlide}
          currentIndex={1}
          totalCount={1}
          flavors={mockFlavors}
          onUpdate={onUpdate}
        />
      );

      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "A");

      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ description: "A" }));
    });

    it("100文字を超える入力はonUpdateが呼ばれない", async () => {
      const onUpdate = vi.fn();
      const longSlide: EditableSlide = { ...mockSlide, description: "a".repeat(100) };
      render(
        <SlideEditForm
          slide={longSlide}
          currentIndex={1}
          totalCount={1}
          flavors={mockFlavors}
          onUpdate={onUpdate}
        />
      );

      const textarea = screen.getByRole("textbox");
      // fire change event directly with a value that exceeds 100 chars
      fireEvent.change(textarea, { target: { value: "a".repeat(101) } });

      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("ナビゲーション", () => {
    it("前のスライドボタンをクリックするとonPreviousが呼ばれる", async () => {
      const onPrevious = vi.fn();
      render(
        <SlideEditForm
          slide={mockSlide}
          currentIndex={2}
          totalCount={3}
          flavors={mockFlavors}
          onUpdate={vi.fn()}
          onPrevious={onPrevious}
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "← 前" }));
      expect(onPrevious).toHaveBeenCalled();
    });

    it("次のスライドボタンをクリックするとonNextが呼ばれる", async () => {
      const onNext = vi.fn();
      render(
        <SlideEditForm
          slide={mockSlide}
          currentIndex={1}
          totalCount={3}
          flavors={mockFlavors}
          onUpdate={vi.fn()}
          onNext={onNext}
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "次 →" }));
      expect(onNext).toHaveBeenCalled();
    });
  });
});
