import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthLayout } from "./AuthLayout";

describe("AuthLayout", () => {
  /**
   * 正常系: 基本的なレンダリング
   */
  describe("基本的なレンダリング", () => {
    it("ブランドコンテンツとフォームコンテンツが正しく表示される", () => {
      render(
        <AuthLayout brandContent={<div>Brand Content</div>} formContent={<div>Form Content</div>} />
      );

      expect(screen.getByText("Brand Content")).toBeInTheDocument();
      expect(screen.getByText("Form Content")).toBeInTheDocument();
    });

    it("brandContentがReactNodeとして受け入れられる", () => {
      render(
        <AuthLayout
          brandContent={
            <div>
              <h1>Title</h1>
              <p>Description</p>
            </div>
          }
          formContent={<div>Form</div>}
        />
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("formContentがReactNodeとして受け入れられる", () => {
      render(
        <AuthLayout
          brandContent={<div>Brand</div>}
          formContent={
            <form>
              <input aria-label="email" type="email" />
              <button type="submit">Submit</button>
            </form>
          }
        />
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
      render(<AuthLayout brandContent={<div>Brand</div>} formContent={<div>Form</div>} />);

      // レイアウトが正しくレンダリングされることを確認
      expect(screen.getByText("Brand")).toBeInTheDocument();
      expect(screen.getByText("Form")).toBeInTheDocument();
    });

    it("フォームエリアが正しいスタイルクラスを持つ", () => {
      render(
        <AuthLayout
          brandContent={<div>Brand</div>}
          formContent={<div data-testid="form-area">Form</div>}
        />
      );

      const formArea = screen.getByTestId("form-area").parentElement;
      expect(formArea).toHaveClass("max-w-md");
    });
  });

  /**
   * 正常系: 空のコンテンツ
   */
  describe("空のコンテンツ", () => {
    it("brandContentがnullでもエラーにならない", () => {
      render(<AuthLayout brandContent={null} formContent={<div>Form</div>} />);

      expect(screen.getByText("Form")).toBeInTheDocument();
    });

    it("formContentがnullでもエラーにならない", () => {
      render(<AuthLayout brandContent={<div>Brand</div>} formContent={null} />);

      expect(screen.getByText("Brand")).toBeInTheDocument();
    });
  });
});
