import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { BackButton } from "./BackButton";

describe("BackButton", () => {
  test("ボタンがレンダリングされる", () => {
    render(<BackButton />);
    expect(screen.getByRole("button", { name: /戻る/ })).toBeInTheDocument();
  });

  test("history がある場合は window.history.back を呼ぶ", async () => {
    const user = userEvent.setup();
    const origHistory = window.history;
    const backMock = vi.fn();
    Object.defineProperty(window, "history", {
      value: { ...origHistory, length: 2, back: backMock },
      configurable: true,
    });

    render(<BackButton />);
    await user.click(screen.getByRole("button", { name: /戻る/ }));
    expect(backMock).toHaveBeenCalled();

    Object.defineProperty(window, "history", { value: origHistory, configurable: true });
  });

  test("history がない場合は router.push('/') を呼ぶ", async () => {
    const user = userEvent.setup();
    const origHistory = window.history;
    const pushMock = vi.fn();
    // mock router via setup's useRouter; but ensure history.length === 1
    Object.defineProperty(window, "history", {
      value: { ...origHistory, length: 1, back: vi.fn() },
      configurable: true,
    });

    const nav = await import("next/navigation");
    const spy = vi.spyOn(nav, "useRouter").mockReturnValue({
      push: pushMock,
      back: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof nav.useRouter>);

    render(<BackButton />);
    await user.click(screen.getByRole("button", { name: /戻る/ }));
    expect(pushMock).toHaveBeenCalledWith("/");

    spy.mockRestore();
    Object.defineProperty(window, "history", { value: origHistory, configurable: true });
  });
});
