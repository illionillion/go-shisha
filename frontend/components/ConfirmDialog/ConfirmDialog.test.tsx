import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useConfirmStore } from "@/lib/confirm-store";
import { render, screen } from "@/test/utils";
import { ConfirmDialog } from "./ConfirmDialog";

// focus-trap-react をモック（子要素をそのままレンダリング）
vi.mock("focus-trap-react", () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  useConfirmStore.getState().reset();
});

describe("ConfirmDialog", () => {
  describe("表示制御", () => {
    it("isOpen が false のとき何も表示されない", () => {
      render(<ConfirmDialog />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("isOpen が true のときダイアログが表示される", () => {
      useConfirmStore.setState({ isOpen: true, message: "確認メッセージ" });
      render(<ConfirmDialog />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("メッセージが正しく表示される", () => {
      useConfirmStore.setState({ isOpen: true, message: "テストメッセージです" });
      render(<ConfirmDialog />);

      expect(screen.getByText("テストメッセージです")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ属性", () => {
    beforeEach(() => {
      useConfirmStore.setState({ isOpen: true, message: "確認しますか？" });
    });

    it("role=\"dialog\" が設定されている", () => {
      render(<ConfirmDialog />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("aria-modal=\"true\" が設定されている", () => {
      render(<ConfirmDialog />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("aria-labelledby が設定されており、メッセージ要素の id と一致する", () => {
      render(<ConfirmDialog />);
      const dialog = screen.getByRole("dialog");
      const labelId = dialog.getAttribute("aria-labelledby");
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId!)).toBeInTheDocument();
    });
  });

  describe("ボタン操作", () => {
    it("OK ボタンをクリックすると resolve(true) が呼ばれてダイアログが閉じる", async () => {
      const mockResolve = vi.fn();
      useConfirmStore.setState({ isOpen: true, message: "確認しますか？", resolve: mockResolve });
      const user = userEvent.setup();
      render(<ConfirmDialog />);

      await user.click(screen.getByRole("button", { name: "OK" }));

      expect(mockResolve).toHaveBeenCalledWith(true);
      expect(useConfirmStore.getState().isOpen).toBe(false);
    });

    it("キャンセルボタンをクリックすると resolve(false) が呼ばれてダイアログが閉じる", async () => {
      const mockResolve = vi.fn();
      useConfirmStore.setState({ isOpen: true, message: "確認しますか？", resolve: mockResolve });
      const user = userEvent.setup();
      render(<ConfirmDialog />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(mockResolve).toHaveBeenCalledWith(false);
      expect(useConfirmStore.getState().isOpen).toBe(false);
    });

    it("バックドロップをクリックすると resolve(false) が呼ばれてダイアログが閉じる", async () => {
      const mockResolve = vi.fn();
      useConfirmStore.setState({ isOpen: true, message: "確認しますか？", resolve: mockResolve });
      render(<ConfirmDialog />);

      const backdrop = screen.getByTestId("confirm-dialog-backdrop");
      await userEvent.click(backdrop);

      expect(mockResolve).toHaveBeenCalledWith(false);
      expect(useConfirmStore.getState().isOpen).toBe(false);
    });
  });
});
