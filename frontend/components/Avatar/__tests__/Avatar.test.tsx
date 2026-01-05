import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import Avatar from "../Avatar";

describe("Avatar", () => {
  test.skip("左クリックは SPA 遷移する (router.push)", async () => {
    const _user = userEvent.setup();
    const pushMock = vi.fn();

    const nav = await import("next/navigation");
    const spy = vi.spyOn(nav, "useRouter").mockReturnValue({
      push: pushMock,
      prefetch: vi.fn(),
      back: vi.fn(),
    } as unknown as ReturnType<typeof nav.useRouter>);

    render(<Avatar userId={1} />);
    await _user.click(screen.getByRole("link"));
    expect(pushMock).toHaveBeenCalledWith("/profile/1");

    spy.mockRestore();
  });

  test.skip("Ctrl/Cmd+クリック は新規タブで開く (window.open)", async () => {
    const _user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={2} />);
    // simulate Ctrl+click via MouseEvent to set modifier keys
    const _elCtrl = screen.getByRole("link");
    _elCtrl.dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true, button: 0 }));
    expect(openSpy).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  test.skip("中クリック (auxclick) は新規タブで開く (window.open)", async () => {
    const _user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={3} />);
    // fire auxclick (button === 1)
    const _el = screen.getByRole("link");
    _el.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 1 }));

    expect(openSpy).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  test.skip("Enter/Space キーで SPA 遷移する", async () => {
    const _user = userEvent.setup();
    const pushMock = vi.fn();

    const nav = await import("next/navigation");
    const spy = vi.spyOn(nav, "useRouter").mockReturnValue({
      push: pushMock,
      prefetch: vi.fn(),
      back: vi.fn(),
    } as unknown as ReturnType<typeof nav.useRouter>);

    render(<Avatar userId={4} />);
    const _el = screen.getByRole("link");
    await _user.keyboard("{Enter}");
    expect(pushMock).toHaveBeenCalledWith("/profile/4");

    spy.mockRestore();
  });
});
