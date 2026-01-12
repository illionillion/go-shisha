import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import type { Flavor } from "@/types/domain";
import { FlavorLabel } from "./FlavorLabel";

describe("FlavorLabel", () => {
  it("フレーバー名を表示する", () => {
    const flavor: Flavor = {
      id: 1,
      name: "ミント",
      color: "bg-green-500",
    };

    render(<FlavorLabel flavor={flavor} />);

    const label = screen.getByText("ミント");
    expect(label).toBeTruthy();
  });

  it.each([
    { id: 1, color: "bg-green-500", name: "ミント" },
    { id: 2, color: "bg-red-500", name: "ストロベリー" },
    { id: 3, color: "bg-purple-500", name: "グレープ" },
    { id: 4, color: "bg-yellow-500", name: "レモン" },
    { id: 5, color: "bg-orange-500", name: "オレンジ" },
    { id: 6, color: "bg-indigo-500", name: "ブルーベリー" },
  ])("$color の色クラスを適用する", ({ id, color, name }) => {
    const flavor: Flavor = {
      id,
      name,
      color,
    };

    render(<FlavorLabel flavor={flavor} />);

    const label = screen.getByText(name);
    expect(label.className).toContain(color);
  });

  it("未定義の色の場合は bg-gray-500 をフォールバックとして適用する", () => {
    const flavor: Flavor = {
      id: 7,
      name: "不明",
      color: "bg-unknown-color",
    };

    render(<FlavorLabel flavor={flavor} />);

    const label = screen.getByText("不明");
    expect(label.className).toContain("bg-gray-500");
  });

  it("color が undefined の場合は bg-gray-500 を適用する", () => {
    const flavor: Flavor = {
      id: 8,
      name: "カラーなし",
      color: undefined,
    };

    render(<FlavorLabel flavor={flavor} />);

    const label = screen.getByText("カラーなし");
    expect(label.className).toContain("bg-gray-500");
  });

  it("カスタム className を適用する", () => {
    const flavor: Flavor = {
      id: 9,
      name: "カスタム",
      color: "bg-green-500",
    };

    render(<FlavorLabel flavor={flavor} className="custom-class" />);

    const label = screen.getByText("カスタム");
    expect(label.className).toContain("custom-class");
    expect(label.className).toContain("bg-green-500");
  });

  it("複数のカスタム className（配列）を適用する", () => {
    const flavor: Flavor = {
      id: 10,
      name: "マルチクラス",
      color: "bg-purple-500",
    };

    render(<FlavorLabel flavor={flavor} className={["class-1", "class-2"]} />);

    const label = screen.getByText("マルチクラス");
    expect(label.className).toContain("class-1");
    expect(label.className).toContain("class-2");
    expect(label.className).toContain("bg-purple-500");
  });

  it("基本的なスタイルクラスが適用されている", () => {
    const flavor: Flavor = {
      id: 11,
      name: "スタイル確認",
      color: "bg-green-500",
    };

    render(<FlavorLabel flavor={flavor} />);

    const label = screen.getByText("スタイル確認");
    expect(label.className).toContain("inline-block");
    expect(label.className).toContain("mt-2");
    expect(label.className).toContain("px-2");
    expect(label.className).toContain("py-1");
    expect(label.className).toContain("text-xs");
    expect(label.className).toContain("rounded-full");
    expect(label.className).toContain("text-white");
    expect(label.className).toContain("select-none");
  });
});
