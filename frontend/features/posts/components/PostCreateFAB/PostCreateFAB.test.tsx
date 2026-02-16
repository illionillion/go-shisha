import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PostCreateFAB } from "./PostCreateFAB";

describe("PostCreateFAB", () => {
  describe("レンダリング", () => {
    it("ボタンが表示される", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      expect(button).toBeInTheDocument();
    });

    it("プラスアイコンが表示される", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const icon = screen.getByRole("button").querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("カスタムaria-labelが設定される", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} aria-label="新しい投稿を作成" />);

      const button = screen.getByRole("button", { name: "新しい投稿を作成" });
      expect(button).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("クリックするとonClickが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("Enterキーで押下できる", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      button.focus();
      await user.keyboard("{Enter}");

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("Spaceキーで押下できる", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      button.focus();
      await user.keyboard(" ");

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("スタイル", () => {
    it("固定位置のクラスが適用されている", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      expect(button).toHaveClass("fixed");
      expect(button).toHaveClass("bottom-20");
      expect(button).toHaveClass("right-6");
      expect(button).toHaveClass("z-50");
    });

    it("円形のクラスが適用されている", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      expect(button).toHaveClass("rounded-full");
    });

    it("背景色のクラスが適用されている", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      expect(button).toHaveClass("bg-blue-600");
    });
  });

  describe("アクセシビリティ", () => {
    it("ボタンタイプがbuttonである", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      expect(button).toHaveAttribute("type", "button");
    });

    it("フォーカス可能である", () => {
      const mockOnClick = vi.fn();
      render(<PostCreateFAB onClick={mockOnClick} />);

      const button = screen.getByRole("button", { name: "投稿作成" });
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
