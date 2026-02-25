import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useConfirmStore } from "./confirm-store";
import { useConfirm } from "./useConfirm";

afterEach(() => {
  useConfirmStore.setState({ isOpen: false, message: "", resolve: null });
});

describe("useConfirm", () => {
  it("confirm 関数を返す", () => {
    const { result } = renderHook(() => useConfirm());
    expect(typeof result.current).toBe("function");
  });

  it("confirm() を呼ぶとストアの isOpen が true になる", async () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current("テストメッセージ");
    });

    expect(useConfirmStore.getState().isOpen).toBe(true);
    expect(useConfirmStore.getState().message).toBe("テストメッセージ");
  });

  it("ストアの confirm() を呼ぶと Promise が true で解決される", async () => {
    const { result } = renderHook(() => useConfirm());

    let resolved: boolean | undefined;
    act(() => {
      result.current("確認しますか？").then((v) => {
        resolved = v;
      });
    });

    await act(async () => {
      useConfirmStore.getState().confirm();
    });

    expect(resolved).toBe(true);
    expect(useConfirmStore.getState().isOpen).toBe(false);
  });

  it("ストアの cancel() を呼ぶと Promise が false で解決される", async () => {
    const { result } = renderHook(() => useConfirm());

    let resolved: boolean | undefined;
    act(() => {
      result.current("確認しますか？").then((v) => {
        resolved = v;
      });
    });

    await act(async () => {
      useConfirmStore.getState().cancel();
    });

    expect(resolved).toBe(false);
    expect(useConfirmStore.getState().isOpen).toBe(false);
  });
});
