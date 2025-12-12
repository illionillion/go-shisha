import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("サイトタイトルが表示される", () => {
    render(<Header />);
    expect(screen.getByText("シーシャ行こう")).toBeInTheDocument();
  });

  it("サイトロゴが表示される", () => {
    render(<Header />);
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("ユーザーアイコンのSVGが表示される", () => {
    const { container } = render(<Header />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
