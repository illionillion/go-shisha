import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@/test/utils";
import type { Flavor } from "@/types/domain";
import { FlavorSelector } from "./FlavorSelector";

describe("FlavorSelector", () => {
  const mockFlavors: Flavor[] = [
    { id: 1, name: "ミント", color: "bg-green-500" },
    { id: 2, name: "ベリー", color: "bg-red-500" },
    { id: 3, name: "グレープ", color: "bg-purple-500" },
  ];

  describe("レンダリング", () => {
    it("ラベルとセレクトボックスを表示する", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector flavors={mockFlavors} selectedFlavorId={undefined} onSelect={onSelect} />
      );

      expect(screen.getByLabelText("フレーバー（任意）")).toBeTruthy();
      expect(screen.getByRole("combobox")).toBeTruthy();
    });

    it("フレーバー一覧を選択肢として表示する", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector flavors={mockFlavors} selectedFlavorId={undefined} onSelect={onSelect} />
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      const options = within(select).getAllByRole("option");

      // "フレーバーを選択してください" + 3つのフレーバー = 4つ
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent("フレーバーを選択してください");
      expect(options[1]).toHaveTextContent("ミント");
      expect(options[2]).toHaveTextContent("ベリー");
      expect(options[3]).toHaveTextContent("グレープ");
    });

    it("選択されたフレーバーのラベルを表示する", () => {
      const onSelect = vi.fn();
      const { container } = render(
        <FlavorSelector flavors={mockFlavors} selectedFlavorId={1} onSelect={onSelect} />
      );

      // FlavorLabelが表示されているか確認（ミント）
      // セレクトボックスのoption内にもテキストがあるため、className でspanタグを特定
      const flavorLabel = container.querySelector(".bg-green-500");
      expect(flavorLabel).toBeTruthy();
      expect(flavorLabel?.textContent).toBe("ミント");
    });

    it("未選択時はフレーバーラベルを表示しない", () => {
      const onSelect = vi.fn();
      const { container } = render(
        <FlavorSelector flavors={mockFlavors} selectedFlavorId={undefined} onSelect={onSelect} />
      );

      // FlavorLabelが表示されていないことを確認
      // セレクトボックスのoption内にフレーバー名は存在するが、FlavorLabel（spanタグ）は存在しない
      const flavorLabel = container.querySelector(".bg-green-500");
      expect(flavorLabel).toBeNull();
    });
  });

  describe("フレーバー選択", () => {
    it("フレーバーを選択できる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(
        <FlavorSelector flavors={mockFlavors} selectedFlavorId={undefined} onSelect={onSelect} />
      );

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "2"); // ベリー（id: 2）を選択

      expect(onSelect).toHaveBeenCalledWith(2);
    });

    it("選択されたフレーバーがセレクトボックスに反映される", () => {
      const onSelect = vi.fn();
      render(<FlavorSelector flavors={mockFlavors} selectedFlavorId={2} onSelect={onSelect} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("2");
    });

    it("別のフレーバーに変更できる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const { rerender, container } = render(
        <FlavorSelector flavors={mockFlavors} selectedFlavorId={1} onSelect={onSelect} />
      );

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "3"); // グレープ（id: 3）に変更

      expect(onSelect).toHaveBeenCalledWith(3);

      // 再レンダリング（親コンポーネントでの状態更新をシミュレート）
      rerender(<FlavorSelector flavors={mockFlavors} selectedFlavorId={3} onSelect={onSelect} />);

      expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("3");
      // FlavorLabelが表示されていることを確認（グレープの色）
      const flavorLabel = container.querySelector(".bg-purple-500");
      expect(flavorLabel).toBeTruthy();
      expect(flavorLabel?.textContent).toBe("グレープ");
    });
  });

  describe("選択解除", () => {
    it("解除ボタンを表示する（選択時のみ）", () => {
      const onSelect = vi.fn();
      const { rerender } = render(
        <FlavorSelector flavors={mockFlavors} selectedFlavorId={undefined} onSelect={onSelect} />
      );

      // 未選択時は解除ボタンなし
      expect(screen.queryByRole("button", { name: "フレーバー選択を解除" })).toBeNull();

      // 選択時は解除ボタンあり
      rerender(<FlavorSelector flavors={mockFlavors} selectedFlavorId={1} onSelect={onSelect} />);
      expect(screen.getByRole("button", { name: "フレーバー選択を解除" })).toBeTruthy();
    });

    it("解除ボタンをクリックして選択を解除できる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<FlavorSelector flavors={mockFlavors} selectedFlavorId={1} onSelect={onSelect} />);

      const clearButton = screen.getByRole("button", { name: "フレーバー選択を解除" });
      await user.click(clearButton);

      expect(onSelect).toHaveBeenCalledWith(undefined);
    });

    it("セレクトボックスで空を選択して選択を解除できる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<FlavorSelector flavors={mockFlavors} selectedFlavorId={1} onSelect={onSelect} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, ""); // 空文字を選択（プレースホルダー）

      expect(onSelect).toHaveBeenCalledWith(undefined);
    });
  });

  describe("エラー状態", () => {
    it("エラーメッセージを表示する", () => {
      const onSelect = vi.fn();
      const errorMessage = "フレーバーの取得に失敗しました";
      render(
        <FlavorSelector
          flavors={mockFlavors}
          selectedFlavorId={undefined}
          onSelect={onSelect}
          error={errorMessage}
        />
      );

      const errorElement = screen.getByRole("alert");
      expect(errorElement).toHaveTextContent(errorMessage);
    });

    it("エラー時にborder-red-500クラスを適用する", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector
          flavors={mockFlavors}
          selectedFlavorId={undefined}
          onSelect={onSelect}
          error="エラー"
        />
      );

      const select = screen.getByRole("combobox");
      expect(select.className).toContain("border-red-500");
    });
  });

  describe("無効化状態", () => {
    it("無効化時にセレクトボックスを無効化する", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector
          flavors={mockFlavors}
          selectedFlavorId={undefined}
          onSelect={onSelect}
          disabled={true}
        />
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });

    it("無効化時に解除ボタンを無効化する", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector
          flavors={mockFlavors}
          selectedFlavorId={1}
          onSelect={onSelect}
          disabled={true}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "フレーバー選択を解除",
      }) as HTMLButtonElement;
      expect(clearButton.disabled).toBe(true);
    });
  });

  describe("アクセシビリティ", () => {
    it("セレクトボックスにaria-invalid属性を設定する（エラー時）", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector
          flavors={mockFlavors}
          selectedFlavorId={undefined}
          onSelect={onSelect}
          error="エラー"
        />
      );

      const select = screen.getByRole("combobox");
      expect(select.getAttribute("aria-invalid")).toBe("true");
    });

    it("セレクトボックスにaria-describedby属性を設定する（エラー時）", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector
          flavors={mockFlavors}
          selectedFlavorId={undefined}
          onSelect={onSelect}
          error="エラー"
        />
      );

      const select = screen.getByRole("combobox");
      expect(select.getAttribute("aria-describedby")).toBe("flavor-error");
    });

    it("解除ボタンにaria-label属性を設定する", () => {
      const onSelect = vi.fn();
      render(<FlavorSelector flavors={mockFlavors} selectedFlavorId={1} onSelect={onSelect} />);

      const clearButton = screen.getByRole("button", { name: "フレーバー選択を解除" });
      expect(clearButton.getAttribute("aria-label")).toBe("フレーバー選択を解除");
    });
  });

  describe("空のフレーバー一覧", () => {
    it("フレーバーなしの場合もレンダリングできる", () => {
      const onSelect = vi.fn();
      render(<FlavorSelector flavors={[]} selectedFlavorId={undefined} onSelect={onSelect} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      const options = within(select).getAllByRole("option");

      // プレースホルダーのみ
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("フレーバーを選択してください");
    });
  });

  describe("カスタムクラス名", () => {
    it("カスタムclassNameを適用できる", () => {
      const onSelect = vi.fn();
      render(
        <FlavorSelector
          flavors={mockFlavors}
          selectedFlavorId={undefined}
          onSelect={onSelect}
          className="custom-class"
        />
      );

      // カスタムクラスが適用されたラベル要素を取得
      const label = screen.getByLabelText("フレーバー（任意）");
      const wrapper = label.closest(".custom-class");
      expect(wrapper).toBeTruthy();
    });
  });
});
