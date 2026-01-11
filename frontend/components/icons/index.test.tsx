import { describe, it, expect } from "vitest";
import { render } from "@/test/utils";
import { PrevIcon, NextIcon } from "./index";

describe("Icons", () => {
  describe("PrevIcon", () => {
    it("SVG 要素をレンダリングする", () => {
      const { container } = render(<PrevIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("デフォルトで text-white クラスを適用する", () => {
      const { container } = render(<PrevIcon />);
      const svg = container.querySelector("svg");
      const classList = svg?.getAttribute("class");
      expect(classList).toContain("text-white");
    });

    it("w-4 と h-4 クラスを適用する", () => {
      const { container } = render(<PrevIcon />);
      const svg = container.querySelector("svg");
      const classList = svg?.getAttribute("class");
      expect(classList).toContain("w-4");
      expect(classList).toContain("h-4");
    });

    it("カスタム className を適用する", () => {
      const { container } = render(<PrevIcon className="text-blue-500" />);
      const svg = container.querySelector("svg");
      const classList = svg?.getAttribute("class");
      expect(classList).toContain("text-blue-500");
      expect(classList).toContain("w-4");
      expect(classList).toContain("h-4");
    });

    it("正しい viewBox を持つ", () => {
      const { container } = render(<PrevIcon />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    });

    it('fill="none" 属性を持つ', () => {
      const { container } = render(<PrevIcon />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("fill")).toBe("none");
    });

    it('stroke="currentColor" 属性を持つ', () => {
      const { container } = render(<PrevIcon />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("stroke")).toBe("currentColor");
    });

    it("左向き矢印の path を持つ", () => {
      const { container } = render(<PrevIcon />);
      const path = container.querySelector("path");
      expect(path).toBeTruthy();
      expect(path?.getAttribute("d")).toBe("M15 19l-7-7 7-7");
    });

    it("path の strokeWidth が 2 である", () => {
      const { container } = render(<PrevIcon />);
      const path = container.querySelector("path");
      expect(path?.getAttribute("stroke-width")).toBe("2");
    });
  });

  describe("NextIcon", () => {
    it("SVG 要素をレンダリングする", () => {
      const { container } = render(<NextIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("デフォルトで text-white クラスを適用する", () => {
      const { container } = render(<NextIcon />);
      const svg = container.querySelector("svg");
      const classList = svg?.getAttribute("class");
      expect(classList).toContain("text-white");
    });

    it("w-4 と h-4 クラスを適用する", () => {
      const { container } = render(<NextIcon />);
      const svg = container.querySelector("svg");
      const classList = svg?.getAttribute("class");
      expect(classList).toContain("w-4");
      expect(classList).toContain("h-4");
    });

    it("カスタム className を適用する", () => {
      const { container } = render(<NextIcon className="text-red-500" />);
      const svg = container.querySelector("svg");
      const classList = svg?.getAttribute("class");
      expect(classList).toContain("text-red-500");
      expect(classList).toContain("w-4");
      expect(classList).toContain("h-4");
    });

    it("正しい viewBox を持つ", () => {
      const { container } = render(<NextIcon />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    });

    it('fill="none" 属性を持つ', () => {
      const { container } = render(<NextIcon />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("fill")).toBe("none");
    });

    it('stroke="currentColor" 属性を持つ', () => {
      const { container } = render(<NextIcon />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("stroke")).toBe("currentColor");
    });

    it("右向き矢印の path を持つ", () => {
      const { container } = render(<NextIcon />);
      const path = container.querySelector("path");
      expect(path).toBeTruthy();
      expect(path?.getAttribute("d")).toBe("M9 5l7 7-7 7");
    });

    it("path の strokeWidth が 2 である", () => {
      const { container } = render(<NextIcon />);
      const path = container.querySelector("path");
      expect(path?.getAttribute("stroke-width")).toBe("2");
    });
  });
});
