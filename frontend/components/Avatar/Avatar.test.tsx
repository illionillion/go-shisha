import React from "react";
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
    // pick the outer wrapper element (the div with aria-label)
    const wrapper = candidates.find((el) => el.tagName.toLowerCase() === "div");
    expect(wrapper).toBeTruthy();

    // next/image should render an actual <img> inside the wrapper in tests
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

    // ensure no <img> inside and an svg fallback exists
    const img = wrapper?.querySelector("img");
    expect(img).toBeNull();
    const svg = wrapper?.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it.skip("middle-click (auxclick) opens profile in new tab - TODO: enable after implementing onAuxClick", () => {
    // This test is intentionally skipped until `onAuxClick` support is implemented.
    // Expected behavior once implemented:
    // - middle-click on the Avatar should call window.open(targetHref, "_blank", "noopener,noreferrer")
    // - the opened window should be focused if possible
    // Example (to be enabled later):
    // const openSpy = vi.spyOn(window, "open").mockImplementation(() => ({ focus: vi.fn() } as any));
    // render(<Avatar userId={123} src={null} alt="u" size={32} linkMode="router" />);
    // const btn = screen.getByRole("link", { name: "u" });
    // fireEvent.auxClick(btn, { button: 1 });
    // expect(openSpy).toHaveBeenCalledWith("/profile/123", "_blank", "noopener,noreferrer");
  });
});
