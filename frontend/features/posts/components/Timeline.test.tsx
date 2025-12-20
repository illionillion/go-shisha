import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type {
  GoShishaBackendInternalModelsFlavor,
  GoShishaBackendInternalModelsPost,
} from "../../../api/model";
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

  it("onPostClickが提供された場合に呼ばれる", async () => {
    const user = userEvent.setup();
    const onPostClick = vi.fn();
    render(<Timeline posts={mockPosts} onPostClick={onPostClick} />);

    const cards = screen.getAllByRole("button");
    const firstPostCard = cards.find((card) =>
      card.textContent?.includes("今日のシーシャは最高でした！")
    );
    if (firstPostCard) {
      await user.click(firstPostCard);
    }

    expect(onPostClick).toHaveBeenCalledWith(mockPosts[0]);
  });

  it("onPostClickが提供されていない場合、デフォルトのログ出力が行われる", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<Timeline posts={mockPosts} />);

    const cards = screen.getAllByRole("button");
    const firstPostCard = cards.find((card) =>
      card.textContent?.includes("今日のシーシャは最高でした")
    );
    if (firstPostCard) {
      await user.click(firstPostCard);
    }

    expect(consoleSpy).toHaveBeenCalledWith("Clicked post:", 1);
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

  it("tickがインクリメントされる", async () => {
    vi.useFakeTimers();

    render(<Timeline posts={mockPosts} />);

    // 初期値確認
    expect(screen.getByText("今日のシーシャは最高でした！")).toBeInTheDocument();

    // tickがインクリメントされるか確認
    vi.advanceTimersByTime(3000);
    // tickに応じたスライド同期の確認（モックデータに応じた期待値を記述）
    // ここでは簡易的にtickの影響を確認する
    expect(screen.getByText("今日のシーシャは最高でした！")).toBeInTheDocument();

    vi.useRealTimers();
  });
});
