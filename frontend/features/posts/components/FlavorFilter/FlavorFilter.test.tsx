import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Flavor } from "@/types/domain";
import { FlavorFilter } from "./FlavorFilter";

const mockFlavors = [
  { id: 1, name: "ミント", color: "bg-green-500" },
  { id: 2, name: "アップル", color: "bg-red-500" },
  { id: 3, name: "ベリー", color: "bg-purple-500" },
];

describe("FlavorFilter", () => {
  it("フレーバー一覧が表示される", () => {
    render(<FlavorFilter flavors={mockFlavors} selectedFlavorIds={[]} onFlavorToggle={vi.fn()} />);

    expect(screen.getByText("フレーバーで絞り込み")).toBeInTheDocument();
    expect(screen.getByText("ミント")).toBeInTheDocument();
    expect(screen.getByText("アップル")).toBeInTheDocument();
    expect(screen.getByText("ベリー")).toBeInTheDocument();
  });

  it("選択されたフレーバーにスタイルが適用される", () => {
    render(
      <FlavorFilter flavors={mockFlavors} selectedFlavorIds={[1, 3]} onFlavorToggle={vi.fn()} />
    );

    const mintCheckbox = screen.getByLabelText("ミントで絞り込む");
    const appleCheckbox = screen.getByLabelText("アップルで絞り込む");
    const berryCheckbox = screen.getByLabelText("ベリーで絞り込む");

    expect(mintCheckbox).toBeChecked();
    expect(appleCheckbox).not.toBeChecked();
    expect(berryCheckbox).toBeChecked();
  });

  it("フレーバーをクリックするとonFlavorToggleが呼ばれる", async () => {
    const user = userEvent.setup();
    const mockOnFlavorToggle = vi.fn();

    render(
      <FlavorFilter
        flavors={mockFlavors}
        selectedFlavorIds={[]}
        onFlavorToggle={mockOnFlavorToggle}
      />
    );

    const mintLabel = screen.getByText("ミント").closest("label");
    if (!mintLabel) throw new Error("Label not found");

    await user.click(mintLabel);

    expect(mockOnFlavorToggle).toHaveBeenCalledWith(1);
    expect(mockOnFlavorToggle).toHaveBeenCalledTimes(1);
  });

  it("複数のフレーバーを選択できる", async () => {
    const user = userEvent.setup();
    const mockOnFlavorToggle = vi.fn();

    render(
      <FlavorFilter
        flavors={mockFlavors}
        selectedFlavorIds={[]}
        onFlavorToggle={mockOnFlavorToggle}
      />
    );

    const mintLabel = screen.getByText("ミント").closest("label");
    const berryLabel = screen.getByText("ベリー").closest("label");

    if (!mintLabel || !berryLabel) throw new Error("Label not found");

    await user.click(mintLabel);
    await user.click(berryLabel);

    expect(mockOnFlavorToggle).toHaveBeenCalledWith(1);
    expect(mockOnFlavorToggle).toHaveBeenCalledWith(3);
    expect(mockOnFlavorToggle).toHaveBeenCalledTimes(2);
  });

  it("フレーバーが空の場合は何も表示されない", () => {
    render(<FlavorFilter flavors={[]} selectedFlavorIds={[]} onFlavorToggle={vi.fn()} />);

    expect(screen.queryByText("フレーバーで絞り込み")).not.toBeInTheDocument();
  });

  it("色情報がaria-hiddenの要素に適用される", () => {
    render(<FlavorFilter flavors={mockFlavors} selectedFlavorIds={[]} onFlavorToggle={vi.fn()} />);

    const mintLabel = screen.getByText("ミント").closest("label");
    const colorIndicator = mintLabel?.querySelector('[aria-hidden="true"]');

    expect(colorIndicator).toHaveClass("bg-green-500");
  });

  it("クリアボタンが表示され、クリックで選択解除が呼ばれる", async () => {
    const user = userEvent.setup();
    const mockOnFlavorToggle = vi.fn();

    render(
      <FlavorFilter
        flavors={mockFlavors}
        selectedFlavorIds={[1, 2]}
        onFlavorToggle={mockOnFlavorToggle}
      />
    );

    const clearButton = screen.getByRole("button", { name: /選択をクリア/ });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);

    expect(mockOnFlavorToggle).toHaveBeenCalledWith(1);
    expect(mockOnFlavorToggle).toHaveBeenCalledWith(2);
    expect(mockOnFlavorToggle).toHaveBeenCalledTimes(2);
  });

  it("flavor.id が undefined の場合 onFlavorToggle に 0 が渡される", async () => {
    const user = userEvent.setup();
    const mockOnFlavorToggle = vi.fn();
    const flavors: Flavor[] = [
      { id: undefined as unknown as number, name: "不明", color: "bg-red-500" },
    ];

    render(
      <FlavorFilter flavors={flavors} selectedFlavorIds={[]} onFlavorToggle={mockOnFlavorToggle} />
    );

    const label = screen.getByText("不明").closest("label");
    if (!label) throw new Error("label not found");
    await user.click(label);

    expect(mockOnFlavorToggle).toHaveBeenCalledWith(0);
  });

  test("flavorsが空の場合、フィルタが表示されない", () => {
    render(<FlavorFilter flavors={[]} selectedFlavorIds={[]} onFlavorToggle={() => {}} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("onFlavorToggleが正しく動作する", () => {
    const mockToggle = vi.fn();
    const flavors = [
      { id: 1, name: "ミント" },
      { id: 2, name: "レモン" },
    ];
    render(<FlavorFilter flavors={flavors} selectedFlavorIds={[1]} onFlavorToggle={mockToggle} />);

    // レモンをクリック
    fireEvent.click(screen.getByText("レモン"));
    expect(mockToggle).toHaveBeenCalledWith(2);

    // ミントをクリック
    fireEvent.click(screen.getByText("ミント"));
    expect(mockToggle).toHaveBeenCalledWith(1);
  });
});
