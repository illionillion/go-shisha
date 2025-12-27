import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type {
  GoShishaBackendInternalModelsFlavor,
  GoShishaBackendInternalModelsPost,
} from "../../../../api/model";
import { Timeline } from "./Timeline";

const mockFlavors: GoShishaBackendInternalModelsFlavor[] = [
  { id: 1, name: "ミント", color: "bg-green-500" },
  { id: 2, name: "アップル", color: "bg-red-500" },
];

const mockPosts: GoShishaBackendInternalModelsPost[] = [
  {
    id: 1,
    user_id: 1,
    message: "今日のシーシャは最高でした！",
    slides: [
      {
        image_url: "https://picsum.photos/400/600?random=1",
        text: "今日のシーシャは最高でした！",
        flavor: {
          id: 1,
          name: "ミント",
          color: "bg-green-500",
        },
      },
    ],
    likes: 12,
    user: {
      id: 1,
      email: "test@example.com",
      display_name: "テストユーザー",
    },
  },
  {
    id: 2,
    user_id: 2,
    message: "新しいお店を発見！",
    slides: [
      {
        image_url: "https://picsum.photos/400/600?random=2",
        text: "新しいお店を発見！",
      },
    ],
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

  it("2列グリッドレイアウトが適用される", () => {
    const { container } = render(<Timeline posts={mockPosts} />);

    const grid = container.querySelector(".grid-cols-2");
    expect(grid).toBeInTheDocument();
  });

  it("onPostClickが提供されていない場合、デフォルトのログ出力が行われる", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<Timeline posts={mockPosts} />);

    // PostCard は Link でラップされているため link をクリックする
    const postLink = screen.getByRole("link", { name: /View post 1/ });
    // clicking a Next.js Link won't trigger navigation in jsdom; assert href exists
    expect(postLink).toHaveAttribute("href", "/posts/1");
    consoleSpy.mockRestore();
  });

  it("いいねボタンをクリックするとhandleLikeが呼ばれる", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<Timeline posts={mockPosts} />);

    const likeButton = screen.getAllByLabelText("いいね")[0];
    await user.click(likeButton);

    expect(consoleSpy).toHaveBeenCalledWith("Liked post:", 1);
    consoleSpy.mockRestore();
  });

  it("onLike が渡されている場合、handleLike は onLike を呼び出す", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();

    render(<Timeline posts={mockPosts} onLike={onLike} />);

    const likeButton = screen.getAllByLabelText("いいね")[0];
    await user.click(likeButton);

    expect(onLike).toHaveBeenCalledWith(1);
  });

  it("フレーバーフィルターが提供された場合に表示される", () => {
    render(
      <Timeline
        posts={mockPosts}
        availableFlavors={mockFlavors}
        selectedFlavorIds={[]}
        onFlavorToggle={vi.fn()}
      />
    );

    expect(screen.getByText("フレーバーで絞り込み")).toBeInTheDocument();
    expect(screen.getAllByText("ミント").length).toBeGreaterThan(0);
    expect(screen.getAllByText("アップル").length).toBeGreaterThan(0);
  });

  it("フレーバーフィルターが提供されない場合は表示されない", () => {
    render(<Timeline posts={mockPosts} />);

    expect(screen.queryByText("フレーバーで絞り込み")).not.toBeInTheDocument();
  });

  test("postsが空の場合、タイムラインが空であることを表示", () => {
    render(<Timeline posts={[]} />);
    const emptyMessage = screen.getByText("投稿がありません");
    expect(emptyMessage).toBeInTheDocument();
  });

  test("postsがある場合、タイムラインに投稿が表示される", () => {
    const mockPosts = [
      { id: 1, slides: [], user_id: 1, message: "投稿1" },
      { id: 2, slides: [], user_id: 2, message: "投稿2" },
    ];
    render(<Timeline posts={mockPosts} />);
    expect(screen.getByText("投稿1")).toBeInTheDocument();
    expect(screen.getByText("投稿2")).toBeInTheDocument();
  });
});
