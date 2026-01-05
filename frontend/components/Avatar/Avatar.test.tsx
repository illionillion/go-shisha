import * as NextNavigation from "next/navigation";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  const mockRouter = (pushMock: unknown) =>
    vi.spyOn(NextNavigation, "useRouter").mockReturnValue({
      push: pushMock,
      prefetch: vi.fn(),
      back: vi.fn(),
    } as unknown as ReturnType<typeof NextNavigation.useRouter>);

  it("src がある場合に next/image をレンダーする", () => {
    // use an absolute placeholder URL so tests don't depend on NEXT_PUBLIC_BACKEND_URL
    render(
      <Avatar
        src="https://placehold.co/80x80/CCCCCC/666666?text=avatar"
        alt="ユーザー名"
        size={48}
      />
    );

    // wrapper has role img and accessible name
    const candidates = screen.getAllByRole("img", { name: "ユーザー名" });
    expect(candidates.length).toBeGreaterThan(0);
    const wrapper = candidates.find((el) => el.tagName.toLowerCase() === "div");
    expect(wrapper).toBeTruthy();

    const img = wrapper?.querySelector("img");
    expect(img).toBeTruthy();
    if (img) expect(img).toHaveAttribute("alt", "ユーザー名");
  });

  it("src がない場合に SVG フォールバックをレンダーする", () => {
    render(<Avatar src={null} alt="匿名" size={32} />);

    const candidates = screen.getAllByRole("img", { name: "匿名" });
    expect(candidates.length).toBeGreaterThan(0);
    const wrapper = candidates.find((el) => el.tagName.toLowerCase() === "div");
    expect(wrapper).toBeTruthy();

    const img = wrapper?.querySelector("img");
    expect(img).toBeNull();
    const svg = wrapper?.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("中クリック（auxclick）でプロフィールを新しいタブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={123} src={null} alt="u" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "u" });
    // 中クリック（auxclick）をシミュレート
    btn.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 1 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/123", "_blank", "noopener,noreferrer");

    openSpy.mockRestore();
  });

  it("Ctrl/Cmd+クリックで新しいタブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={456} src={null} alt="v" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "v" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true, button: 0 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/456", "_blank", "noopener,noreferrer");

    openSpy.mockRestore();
  });

  it("中クリックで window.open が focus を返す場合に focus を呼ぶ", () => {
    const focusMock = vi.fn();
    const openSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => ({ focus: focusMock }) as unknown as Window);

    render(<Avatar userId={200} src={null} alt="w" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "w" });
    btn.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 1 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/200", "_blank", "noopener,noreferrer");
    expect(focusMock).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it("window.open が null を返してもエラーにならず focus を呼ばない", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={201} src={null} alt="x" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "x" });
    btn.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 1 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/201", "_blank", "noopener,noreferrer");

    openSpy.mockRestore();
  });

  it("Enter は SPA ナビゲーションを行う", () => {
    const pushMock = vi.fn();
    const spy = mockRouter(pushMock);

    render(<Avatar userId={300} src={null} alt="k" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "k" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(pushMock).toHaveBeenCalledWith("/profile/300");

    spy.mockRestore();
  });

  it("Space は SPA ナビゲーションを行う", () => {
    const pushMock = vi.fn();
    const spy = mockRouter(pushMock);

    render(<Avatar userId={301} src={null} alt="sp" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "sp" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(pushMock).toHaveBeenCalledWith("/profile/301");

    spy.mockRestore();
  });

  it("Ctrl+Enter は新しいタブで開く", () => {
    const pushMock = vi.fn();
    const spy = mockRouter(pushMock);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={302} src={null} alt="ctrl" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "ctrl" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith("/profile/302", "_blank", "noopener,noreferrer");

    openSpy.mockRestore();
    spy.mockRestore();
  });

  it("左クリック（修飾なし）は SPA ナビゲーションを行う", () => {
    const pushMock = vi.fn();
    const spy = mockRouter(pushMock);

    render(<Avatar userId={500} src={null} alt="left" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "left" });
    // 左クリック（button 0）
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(pushMock).toHaveBeenCalledWith("/profile/500");

    spy.mockRestore();
  });

  it("linkMode='link' のとき anchor をレンダーする", () => {
    render(<Avatar userId={400} src={null} alt="a" size={32} linkMode="link" />);
    const anchor = screen.getByRole("link", { name: "a" });
    expect(anchor.tagName.toLowerCase()).toBe("a");
  });

  it("targetHref がない場合はリンク役割なしで内部をレンダーする", () => {
    render(<Avatar src={null} alt="nohref" size={24} />);
    // img のロールは存在する
    const imgs = screen.getAllByRole("img", { name: "nohref" });
    expect(imgs.length).toBeGreaterThan(0);
    // link のロールは存在しない
    const links = screen.queryByRole("link", { name: "nohref" });
    expect(links).toBeNull();
  });
});
