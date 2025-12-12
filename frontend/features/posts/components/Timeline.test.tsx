import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { Timeline } from "./Timeline";

const mockPosts: GoShishaBackendInternalModelsPost[] = [
  {
    id: 1,
    user_id: 1,
    message: "今日のシーシャは最高でした！",
    image_url: "https://picsum.photos/400/600?random=1",
    likes: 12,
    user: {
      id: 1,
      email: "test@example.com",
      display_name: "テストユーザー",
    },
    flavor: {
      id: 1,
      name: "ミント",
      color: "bg-green-500",
    },
  },
  {
    id: 2,
    user_id: 2,
    message: "新しいお店を発見！",
    image_url: "https://picsum.photos/400/600?random=2",
    likes: 8,
    user: {
      id: 2,
      email: "shisha@example.com",
      display_name: "シーシャマスター",
    },
  },
];

describe("Timeline", () => {
  it("投稿一覧が表示される", () => {
    render(<Timeline posts={mockPosts} />);

    expect(screen.getByText("今日のシーシャは最高でした！")).toBeInTheDocument();
    expect(screen.getByText("新しいお店を発見！")).toBeInTheDocument();
  });

  it("ローディング状態が表示される", () => {
    render(<Timeline posts={[]} isLoading={true} />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー状態が表示される", () => {
    render(<Timeline posts={[]} error="エラーが発生しました" />);

    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
  });

  it("投稿がない場合は空のグリッドが表示される", () => {
    const { container } = render(<Timeline posts={[]} />);

    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid?.children.length).toBe(0);
  });

  it("2列グリッドレイアウトが適用される", () => {
    const { container } = render(<Timeline posts={mockPosts} />);

    const grid = container.querySelector(".grid-cols-2");
    expect(grid).toBeInTheDocument();
  });

  it("onPostClickが提供された場合に呼ばれる", () => {
    const onPostClick = vi.fn();
    const { container } = render(<Timeline posts={mockPosts} onPostClick={onPostClick} />);

    const firstCard = container.querySelector(".cursor-pointer");
    if (firstCard) {
      firstCard.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }

    expect(onPostClick).toHaveBeenCalledWith(mockPosts[0]);
  });
});
