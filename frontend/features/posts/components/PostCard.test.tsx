import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { PostCard } from "./PostCard";

const mockPost: GoShishaBackendInternalModelsPost = {
  id: 1,
  user_id: 1,
  message: "今日のシーシャは最高でした！",
  image_url: "https://picsum.photos/400/600?random=1",
  likes: 12,
  user: {
    id: 1,
    email: "test@example.com",
    display_name: "テストユーザー",
    description: "シーシャ大好き！",
    icon_url: "",
    external_url: "",
  },
  flavor_id: 1,
  flavor: {
    id: 1,
    name: "ミント",
    color: "bg-green-500",
  },
};

describe("PostCard", () => {
  it("投稿内容が表示される", () => {
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    expect(screen.getByText("今日のシーシャは最高でした！")).toBeInTheDocument();
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
  });

  it("フレーバーバッジが表示される", () => {
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    expect(screen.getByText("ミント")).toBeInTheDocument();
  });

  it("フレーバーがない場合は表示されない", () => {
    const postWithoutFlavor = { ...mockPost, flavor: undefined };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithoutFlavor} onLike={onLike} onClick={onClick} />);

    expect(screen.queryByText("ミント")).not.toBeInTheDocument();
  });

  it("カードをクリックするとonClickが呼ばれる", () => {
    const onLike = vi.fn();
    const onClick = vi.fn();

    const { container } = render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);
    const card = container.querySelector(".cursor-pointer");

    if (card) {
      fireEvent.click(card);
    }

    expect(onClick).toHaveBeenCalledWith(mockPost);
  });

  it("いいねボタンをクリックするとonLikeが呼ばれる", () => {
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    fireEvent.click(likeButton);

    expect(onLike).toHaveBeenCalledWith(1);
  });

  it("いいねボタンをクリックしてもonClickは呼ばれない（イベント伝播停止）", () => {
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    fireEvent.click(likeButton);

    expect(onClick).not.toHaveBeenCalled();
  });
});
