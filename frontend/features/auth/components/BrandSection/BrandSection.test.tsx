import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandSection } from "./BrandSection";

describe("BrandSection", () => {
  /**
   * 正常系: 基本的なレンダリング
   */
  describe("基本的なレンダリング", () => {
    it("ロゴが正しく表示される", () => {
      render(<BrandSection />);

      expect(screen.getByText("Go Shisha")).toBeInTheDocument();
    });

    it("キャッチコピーが正しく表示される", () => {
      render(<BrandSection />);

      expect(screen.getByText("あなたのシーシャ体験を共有しよう")).toBeInTheDocument();
    });

    it("全ての特徴リストが表示される", () => {
      render(<BrandSection />);

      expect(screen.getByText("投稿でシェア")).toBeInTheDocument();
      expect(screen.getByText("いいねで交流")).toBeInTheDocument();
      expect(screen.getByText("コミュニティ参加")).toBeInTheDocument();
      expect(screen.getByText("お気に入りを発見")).toBeInTheDocument();
    });
  });

  /**
   * 正常系: アイコン表示
   */
  describe("アイコン表示", () => {
    it("全てのアイコンが表示される", () => {
      render(<BrandSection />);

      // アイコン（絵文字）が含まれる要素を確認
      const icons = ["📸", "❤️", "👥", "🔍"];
      icons.forEach((icon) => {
        expect(screen.getByText(icon)).toBeInTheDocument();
      });
    });
  });

  /**
   * 正常系: スタイリング
   */
  describe("スタイリング", () => {
    it("グラデーション背景が適用されている", () => {
      const { container } = render(<BrandSection />);

      const brandSection = container.firstChild as HTMLElement;
      expect(brandSection).toHaveClass("bg-gradient-to-br");
      expect(brandSection).toHaveClass("from-purple-600");
      expect(brandSection).toHaveClass("via-pink-500");
      expect(brandSection).toHaveClass("to-orange-400");
    });

    it("白文字が適用されている", () => {
      const { container } = render(<BrandSection />);

      const brandSection = container.firstChild as HTMLElement;
      expect(brandSection).toHaveClass("text-white");
    });
  });

  /**
   * 正常系: レイアウト構造
   */
  describe("レイアウト構造", () => {
    it("中央配置レイアウトが適用されている", () => {
      const { container } = render(<BrandSection />);

      const brandSection = container.firstChild as HTMLElement;
      expect(brandSection).toHaveClass("flex");
      expect(brandSection).toHaveClass("items-center");
      expect(brandSection).toHaveClass("justify-center");
    });

    it("h1要素でロゴが表示されている", () => {
      render(<BrandSection />);

      const logo = screen.getByRole("heading", { level: 1 });
      expect(logo).toHaveTextContent("Go Shisha");
    });
  });
});
