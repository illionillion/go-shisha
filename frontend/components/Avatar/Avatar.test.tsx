import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders next/image when src is provided", () => {
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

  it("renders SVG fallback when src is not provided", () => {
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

  it("middle-click (auxclick) opens profile in new tab", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={123} src={null} alt="u" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "u" });
    // simulate auxclick (middle click)
    btn.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 1 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/123", "_blank", "noopener,noreferrer");

    openSpy.mockRestore();
  });

  it("Ctrl/Cmd+click opens in new tab", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null as unknown as Window);

    render(<Avatar userId={456} src={null} alt="v" size={32} linkMode="router" />);
    const btn = screen.getByRole("link", { name: "v" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true, button: 0 }));

    expect(openSpy).toHaveBeenCalledWith("/profile/456", "_blank", "noopener,noreferrer");

    openSpy.mockRestore();
  });
});
