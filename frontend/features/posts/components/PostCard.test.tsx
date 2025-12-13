import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("カードをクリックするとonClickが呼ばれる", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);
    const buttons = screen.getAllByRole("button");
    const card = buttons.find((button) =>
      button.textContent?.includes("今日のシーシャは最高でした！")
    );
    if (card) {
      await user.click(card);
    }

    expect(onClick).toHaveBeenCalledWith(mockPost);
  });

  it("いいねボタンをクリックするとonLikeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    await user.click(likeButton);

    expect(onLike).toHaveBeenCalledWith(1);
  });

  it("いいねボタンをクリックしてもonClickは呼ばれない（イベント伝播停止）", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    await user.click(likeButton);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("いいねボタンをクリックすると状態が変化する", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    const svg = likeButton.querySelector("svg");

    // 初期状態: fillなし
    expect(svg).not.toHaveClass("fill-current");

    await user.click(likeButton);

    // クリック後: fillあり
    expect(svg).toHaveClass("fill-current");
  });

  it("post.idがundefinedの場合、onLikeが呼ばれない", async () => {
    const user = userEvent.setup();
    const postWithoutId = { ...mockPost, id: undefined };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithoutId} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    await user.click(likeButton);

    expect(onLike).not.toHaveBeenCalled();
  });

  it("image_urlがundefinedの場合、フォールバック画像が表示される", () => {
    const postWithoutImage = { ...mockPost, image_url: undefined };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithoutImage} onLike={onLike} onClick={onClick} />);

    const img = screen.getByAltText("今日のシーシャは最高でした！");
    expect(img).toHaveAttribute("src", expect.stringContaining("placehold.co"));
  });

  it("image_urlが相対パスの場合、NEXT_PUBLIC_BACKEND_URLが設定されていれば結合される", () => {
    const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8080";

    const postWithRelativeImage = { ...mockPost, image_url: "/images/test.jpg" };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithRelativeImage} onLike={onLike} onClick={onClick} />);

    const img = screen.getByAltText("今日のシーシャは最高でした！");
    expect(img).toHaveAttribute("src", expect.stringContaining("localhost%3A8080"));

    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });

  it("image_urlが相対パスの場合、NEXT_PUBLIC_BACKEND_URLが未設定ならフォールバック画像", () => {
    const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;

    const postWithRelativeImage = { ...mockPost, image_url: "/images/test.jpg" };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithRelativeImage} onLike={onLike} onClick={onClick} />);

    const img = screen.getByAltText("今日のシーシャは最高でした！");
    expect(img).toHaveAttribute("src", expect.stringContaining("placehold.co"));

    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });

  it("image_urlが絶対パスの場合、そのまま使用される", () => {
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    const img = screen.getByAltText("今日のシーシャは最高でした！");
    expect(img).toHaveAttribute("src", expect.stringContaining("picsum.photos"));
  });

  it("フレーバーのcolorがundefinedの場合、デフォルトのbg-gray-500が適用される", () => {
    const postWithUndefinedColor = {
      ...mockPost,
      flavor: { ...mockPost.flavor, color: undefined },
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithUndefinedColor} onLike={onLike} onClick={onClick} />);

    const flavorBadge = screen.getByText("ミント");
    expect(flavorBadge).toHaveClass("bg-gray-500");
  });

  it("フレーバーのcolorが未知の場合、デフォルトのbg-gray-500が適用される", () => {
    const postWithUnknownColor = {
      ...mockPost,
      flavor: { ...mockPost.flavor, color: "bg-unknown-500" },
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithUnknownColor} onLike={onLike} onClick={onClick} />);

    const flavorBadge = screen.getByText("ミント");
    expect(flavorBadge).toHaveClass("bg-gray-500");
  });

  it("post.messageがundefinedの場合、alt属性がデフォルト値になる", () => {
    const postWithoutMessage = { ...mockPost, message: undefined };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithoutMessage} onLike={onLike} onClick={onClick} />);

    const img = screen.getByAltText("シーシャ投稿");
    expect(img).toBeInTheDocument();
  });
});
