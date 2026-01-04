import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import type { Post } from "@/types/domain";
import { PostCard } from "./PostCard";

const mockPost: Post = {
  id: 1,
  slides: [
    { image_url: "https://example.com/a.jpg", text: "A" },
    { image_url: "https://example.com/b.jpg", text: "B" },
  ],
  user: { display_name: "u" },
};

describe("PostCard interactions", () => {
  test("Prev/Next ボタンでスライドが切り替わる", async () => {
    const onLike = vi.fn();
    render(<PostCard post={mockPost} onLike={onLike} />);

    // 初期は A が表示
    expect(screen.getByText("A")).toBeTruthy();

    const next = screen.getByLabelText("次のスライド");
    await userEvent.click(next);
    // B が表示されることを期待
    expect(screen.queryByText("B")).toBeTruthy();

    const prev = screen.getByLabelText("前のスライド");
    await userEvent.click(prev);
    expect(screen.queryByText("A")).toBeTruthy();
  });
});
