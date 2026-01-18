import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPageLayout } from "./AuthPageLayout";

describe("AuthPageLayout", () => {
  /**
   * 正常系: 基本的なレンダリング
   */
  describe("基本的なレンダリング", () => {
    it("子要素が正しく表示される", () => {
      render(
        <AuthPageLayout>
          <div>Form Content</div>
        </AuthPageLayout>
      );

      expect(screen.getByText("Form Content")).toBeInTheDocument();
    });

    it("BrandSectionが自動的に表示される", () => {
      render(
        <AuthPageLayout>
          <div>Form</div>
        </AuthPageLayout>
      );

      // BrandSectionのロゴが表示されることを確認
      expect(screen.getByText("Go Shisha")).toBeInTheDocument();
      expect(screen.getByText("あなたのシーシャ体験を共有しよう")).toBeInTheDocument();
    });

    it("childrenがReactNodeとして受け入れられる", () => {
      render(
        <AuthPageLayout>
          <form>
            <input aria-label="email" type="email" />
            <button type="submit">Submit</button>
          </form>
        </AuthPageLayout>
      );

      expect(screen.getByLabelText("email")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    });
  });

  /**
   * 正常系: レイアウト構造
   */
  describe("レイアウト構造", () => {
    it("2カラムレイアウトが適用されている", () => {
      render(
        <AuthPageLayout>
          <div>Form</div>
        </AuthPageLayout>
      );

      // レイアウトが正しくレンダリングされることを確認
      expect(screen.getByText("Go Shisha")).toBeInTheDocument();
      expect(screen.getByText("Form")).toBeInTheDocument();
    });

    it("フォームエリアが正しいスタイルクラスを持つ", () => {
      render(
        <AuthPageLayout>
          <div data-testid="form-area">Form</div>
        </AuthPageLayout>
      );

      const formArea = screen.getByTestId("form-area").parentElement;
      expect(formArea).toHaveClass("max-w-md");
    });
  });

  /**
   * 正常系: 空のコンテンツ
   */
  describe("空のコンテンツ", () => {
    it("childrenがnullでもBrandSectionは表示される", () => {
      render(<AuthPageLayout>{null}</AuthPageLayout>);

      expect(screen.getByText("Go Shisha")).toBeInTheDocument();
    });

    it("childrenが空でもエラーにならない", () => {
      render(<AuthPageLayout>{undefined}</AuthPageLayout>);

      expect(screen.getByText("Go Shisha")).toBeInTheDocument();
    });
  });
});
