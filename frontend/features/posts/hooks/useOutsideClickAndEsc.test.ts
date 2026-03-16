import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useOutsideClickAndEsc } from "./useOutsideClickAndEsc";

describe("useOutsideClickAndEsc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("isOpenがfalseのときはmousedownとkeydownのイベントリスナーを登録しない", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const ref = { current: document.createElement("div") };
    const onClose = vi.fn();

    renderHook(() => useOutsideClickAndEsc({ ref, isOpen: false, onClose }));

    const mousedownCalls = addEventListenerSpy.mock.calls.filter(([type]) => type === "mousedown");
    const keydownCalls = addEventListenerSpy.mock.calls.filter(([type]) => type === "keydown");
    expect(mousedownCalls).toHaveLength(0);
    expect(keydownCalls).toHaveLength(0);
  });

  it("isOpenがtrueのときにmousedownとkeydownのイベントリスナーを登録する", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const ref = { current: document.createElement("div") };
    const onClose = vi.fn();

    renderHook(() => useOutsideClickAndEsc({ ref, isOpen: true, onClose }));

    expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("ESCキーを押すとonCloseが呼ばれる", () => {
    const ref = { current: document.createElement("div") };
    const onClose = vi.fn();

    renderHook(() => useOutsideClickAndEsc({ ref, isOpen: true, onClose }));

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ESC以外のキーを押してもonCloseは呼ばれない", () => {
    const ref = { current: document.createElement("div") };
    const onClose = vi.fn();

    renderHook(() => useOutsideClickAndEsc({ ref, isOpen: true, onClose }));

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ref要素の外をクリックするとonCloseが呼ばれる", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const ref = { current: element };
    const onClose = vi.fn();
    const outsideElement = document.createElement("button");
    document.body.appendChild(outsideElement);

    renderHook(() => useOutsideClickAndEsc({ ref, isOpen: true, onClose }));

    act(() => {
      outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });

  it("ref要素の内側をクリックしてもonCloseは呼ばれない", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const ref = { current: element };
    const onClose = vi.fn();

    renderHook(() => useOutsideClickAndEsc({ ref, isOpen: true, onClose }));

    act(() => {
      element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(onClose).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it("アンマウント時にイベントリスナーが解除される", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const ref = { current: document.createElement("div") };
    const onClose = vi.fn();

    const { unmount } = renderHook(() => useOutsideClickAndEsc({ ref, isOpen: true, onClose }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("isOpenがfalseに変わるとイベントリスナーが解除される", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const ref = { current: document.createElement("div") };
    const onClose = vi.fn();

    const { rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) => useOutsideClickAndEsc({ ref, isOpen, onClose }),
      { initialProps: { isOpen: true } }
    );

    rerender({ isOpen: false });

    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("isOpenがfalseからtrueに変わるとイベントリスナーが登録される", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const ref = { current: document.createElement("div") };
    const onClose = vi.fn();

    const { rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) => useOutsideClickAndEsc({ ref, isOpen, onClose }),
      { initialProps: { isOpen: false } }
    );

    addEventListenerSpy.mockClear();
    rerender({ isOpen: true });

    expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});
