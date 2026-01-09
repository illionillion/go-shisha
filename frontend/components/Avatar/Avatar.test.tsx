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

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
  });

  it("Ctrl/Cmd+クリックで新しいタブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={456} src={null} alt="v" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "v" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true, button: 0 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/456", "_blank", "noopener,noreferrer");
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
  });

  it("window.open が null を返してもエラーにならず focus を呼ばない", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={201} src={null} alt="x" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "x" });
    btn.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 1 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/201", "_blank", "noopener,noreferrer");
  });

  it("Enter は SPA ナビゲーションを行う", () => {
    const pushMock = vi.fn();
    mockRouter(pushMock);

    render(<Avatar userId={300} src={null} alt="k" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "k" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(pushMock).toHaveBeenCalledWith("/profile/300");
  });

  it("Space は SPA ナビゲーションを行う", () => {
    const pushMock = vi.fn();
    mockRouter(pushMock);

    render(<Avatar userId={301} src={null} alt="sp" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "sp" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(pushMock).toHaveBeenCalledWith("/profile/301");
  });

  it("Ctrl+Enter は新しいタブで開く", () => {
    mockRouter(undefined);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={302} src={null} alt="ctrl" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "ctrl" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith("/profile/302", "_blank", "noopener,noreferrer");
  });

  it("左クリック（修飾なし）は SPA ナビゲーションを行う", () => {
    const pushMock = vi.fn();
    mockRouter(pushMock);

    render(<Avatar userId={500} src={null} alt="left" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "left" });
    // 左クリック（button 0）
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(pushMock).toHaveBeenCalledWith("/profile/500");
  });

  it("linkMode='link' のとき anchor をレンダーする", () => {
    render(<Avatar userId={400} src={null} alt="a" size={32} linkMode="link" />);
    const anchor = screen.getByRole("link", { name: "a" });
    expect(anchor.tagName.toLowerCase()).toBe("a");
  });

  it("linkMode='auto' のときは router モードで動作する（デフォルト）", () => {
    const pushMock = vi.fn();
    mockRouter(pushMock);

    // linkMode を指定しない（デフォルトは "auto"）
    render(<Avatar userId={700} src={null} alt="auto-mode" size={32} />);
    const btn = screen.getByRole("link", { name: "auto-mode" });
    // ボタンとしてレンダーされる（anchor ではない）
    expect(btn.tagName.toLowerCase()).toBe("button");

    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
    expect(pushMock).toHaveBeenCalledWith("/profile/700");
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

  it("Meta+クリックで新しいタブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={457} src={null} alt="meta" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "meta" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, metaKey: true, button: 0 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/457", "_blank", "noopener,noreferrer");
  });

  it("Shift+クリックで新しいタブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={458} src={null} alt="shift" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "shift" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true, button: 0 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/458", "_blank", "noopener,noreferrer");
  });

  it("Alt+クリックで新しいタブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={459} src={null} alt="altkey" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "altkey" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, altKey: true, button: 0 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/459", "_blank", "noopener,noreferrer");
  });

  it("Meta+Enter は新しいタブで開く", () => {
    mockRouter(undefined);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={303} src={null} alt="meta-enter" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "meta-enter" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith("/profile/303", "_blank", "noopener,noreferrer");
  });

  it("Shift+Space は新しいタブで開く", () => {
    mockRouter(undefined);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={304} src={null} alt="shift-space" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "shift-space" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: " ", shiftKey: true, bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith("/profile/304", "_blank", "noopener,noreferrer");
  });

  it("Alt+Enter は新しいタブで開く", () => {
    mockRouter(undefined);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={305} src={null} alt="alt-enter" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "alt-enter" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", altKey: true, bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith("/profile/305", "_blank", "noopener,noreferrer");
  });

  it("href 指定時は userId より href が優先される", () => {
    const pushMock = vi.fn();
    mockRouter(pushMock);

    render(
      <Avatar
        userId={600}
        href="/custom-path"
        src={null}
        alt="href-prio"
        size={32}
        linkMode="router"
      />
    );
    const btn = screen.getByRole("link", { name: "href-prio" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(pushMock).toHaveBeenCalledWith("/custom-path");
  });

  it("Enter/Space 以外のキーでは何もしない", () => {
    const pushMock = vi.fn();
    mockRouter(pushMock);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={306} src={null} alt="other-key" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "other-key" });

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(pushMock).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("右クリック（button=2）では何もしない", () => {
    const pushMock = vi.fn();
    mockRouter(pushMock);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={307} src={null} alt="right-click" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "right-click" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 2 }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });
});
