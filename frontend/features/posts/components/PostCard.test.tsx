import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { GoShishaBackendInternalModelsPost } from "../../../api/model";
import { PostCard } from "./PostCard";

const mockPost: GoShishaBackendInternalModelsPost = {
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
    description: "シーシャ大好き！",
    icon_url: "",
    external_url: "",
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
    const postWithoutFlavor = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "今日のシーシャは最高でした！",
          flavor: undefined,
        },
      ],
    };
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

  it("初期 is_liked=true のとき SVG に fill-current が付与される", () => {
    const postLiked = { ...mockPost, is_liked: true } as GoShishaBackendInternalModelsPost;
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postLiked} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    const svg = likeButton.querySelector("svg");
    expect(svg).toHaveClass("fill-current");
  });

  it("onUnlike が渡されているとき、解除クリックで onUnlike が呼ばれる", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    const onUnlike = vi.fn();
    const onClick = vi.fn();

    const likedPost = { ...mockPost, is_liked: true } as GoShishaBackendInternalModelsPost;
    render(<PostCard post={likedPost} onLike={onLike} onUnlike={onUnlike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    await user.click(likeButton);

    expect(onUnlike).toHaveBeenCalledWith(1);
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
    const postWithoutImage = {
      ...mockPost,
      slides: [
        {
          image_url: undefined,
          text: "今日のシーシャは最高でした！",
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithoutImage} onLike={onLike} onClick={onClick} />);

    const img = screen.getByAltText("今日のシーシャは最高でした！");
    expect(img).toHaveAttribute("src", expect.stringContaining("placehold.co"));
  });

  it("image_urlが相対パスの場合、NEXT_PUBLIC_BACKEND_URLが設定されていれば結合される", () => {
    const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8080";

    const postWithRelativeImage = {
      ...mockPost,
      slides: [
        {
          image_url: "/images/test.jpg",
          text: "今日のシーシャは最高でした！",
        },
      ],
    };
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

    const postWithRelativeImage = {
      ...mockPost,
      slides: [
        {
          image_url: "/images/test.jpg",
          text: "今日のシーシャは最高でした！",
        },
      ],
    };
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
      slides: [
        {
          ...mockPost.slides?.[0],
          flavor: { id: 1, name: "ミント", color: undefined },
        },
      ],
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
      slides: [
        {
          ...mockPost.slides?.[0],
          flavor: { id: 1, name: "ミント", color: "bg-unknown-500" },
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithUnknownColor} onLike={onLike} onClick={onClick} />);

    const flavorBadge = screen.getByText("ミント");
    expect(flavorBadge).toHaveClass("bg-gray-500");
  });

  it("post.messageがundefinedの場合、alt属性がデフォルト値になる", () => {
    const postWithoutMessage = {
      ...mockPost,
      message: undefined,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "",
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={postWithoutMessage} onLike={onLike} onClick={onClick} />);

    const img = screen.getByAltText("シーシャ投稿");
    expect(img).toBeInTheDocument();
  });

  // スライド機能のテスト
  it("単一スライドの場合、進捗バーと切り替えボタンが表示されない", () => {
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    expect(screen.queryByLabelText("前のスライド")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("次のスライド")).not.toBeInTheDocument();
  });

  it("複数スライドの場合、進捗バーと切り替えボタンが表示される", () => {
    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
          flavor: { id: 1, name: "ミント", color: "bg-green-500" },
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
          flavor: { id: 2, name: "ベリー", color: "bg-purple-500" },
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={multiSlidePost} onLike={onLike} onClick={onClick} />);

    expect(screen.getByLabelText("前のスライド")).toBeInTheDocument();
    expect(screen.getByLabelText("次のスライド")).toBeInTheDocument();
  });

  it("次のスライドボタンをクリックすると、次のスライドが表示される", async () => {
    const user = userEvent.setup();
    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
          flavor: { id: 1, name: "ミント", color: "bg-green-500" },
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
          flavor: { id: 2, name: "ベリー", color: "bg-purple-500" },
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={multiSlidePost} onLike={onLike} onClick={onClick} />);

    expect(screen.getByText("1枚目")).toBeInTheDocument();
    expect(screen.getByText("ミント")).toBeInTheDocument();

    const nextButton = screen.getByLabelText("次のスライド");
    await user.click(nextButton);

    expect(screen.getByText("2枚目")).toBeInTheDocument();
    expect(screen.getByText("ベリー")).toBeInTheDocument();
  });

  it("前のスライドボタンをクリックすると、前のスライドが表示される", async () => {
    const user = userEvent.setup();
    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
          flavor: { id: 1, name: "ミント", color: "bg-green-500" },
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
          flavor: { id: 2, name: "ベリー", color: "bg-purple-500" },
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={multiSlidePost} onLike={onLike} onClick={onClick} />);

    const prevButton = screen.getByLabelText("前のスライド");
    await user.click(prevButton);

    // 最初のスライドから前に戻ると最後のスライドに戻る
    expect(screen.getByText("2枚目")).toBeInTheDocument();
    expect(screen.getByText("ベリー")).toBeInTheDocument();
  });

  it("スライド切り替えボタンをクリックしてもonClickは呼ばれない（イベント伝播停止）", async () => {
    const user = userEvent.setup();
    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(<PostCard post={multiSlidePost} onLike={onLike} onClick={onClick} />);

    const nextButton = screen.getByLabelText("次のスライド");
    await user.click(nextButton);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("前ボタンで先頭から最後に戻り、次ボタンで最後から先頭に戻るラップ動作を確認する", async () => {
    const user = userEvent.setup();
    const multiSlidePost = {
      ...mockPost,
      slides: [
        { image_url: "https://picsum.photos/400/600?random=1", text: "S1" },
        { image_url: "https://picsum.photos/400/600?random=2", text: "S2" },
        { image_url: "https://picsum.photos/400/600?random=3", text: "S3" },
      ],
    } as unknown as GoShishaBackendInternalModelsPost;

    render(<PostCard post={multiSlidePost} onLike={() => {}} onClick={() => {}} />);

    // 初期は S1
    expect(screen.getByText("S1")).toBeInTheDocument();

    // 前ボタンを押すと最後のスライド S3 に戻る
    const prev = screen.getByLabelText("前のスライド");
    await user.click(prev);
    expect(screen.getByText("S3")).toBeInTheDocument();

    // 次ボタンを押すと S1 に戻る
    const next = screen.getByLabelText("次のスライド");
    await user.click(next);
    expect(screen.getByText("S1")).toBeInTheDocument();
  });

  it("自動切り替えが動作する（タイマーテスト）", async () => {
    vi.useFakeTimers();

    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    render(
      <PostCard post={multiSlidePost} onLike={onLike} onClick={onClick} autoPlayInterval={1000} />
    );

    expect(screen.getByText("1枚目")).toBeInTheDocument();

    // 1秒後に次のスライドに切り替わる
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await vi.waitFor(() => {
      expect(screen.getByText("2枚目")).toBeInTheDocument();
    });

    // さらに1秒後に最初のスライドに戻る
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await vi.waitFor(() => {
      expect(screen.getByText("1枚目")).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it("onUnlikeが未定義の場合、いいね解除でonLikeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    const onClick = vi.fn();

    // onUnlike を未定義でレンダリング
    render(<PostCard post={mockPost} onLike={onLike} onClick={onClick} />);

    const likeButton = screen.getByLabelText("いいね");
    // いいね (onLike を呼ぶ)
    await user.click(likeButton);
    // 解除 (onUnlike undefined -> fallback to onLike)
    await user.click(likeButton);

    expect(onLike).toHaveBeenCalledTimes(2);
  });

  // プログレスバーのテスト
  it("複数スライドの場合、プログレスバーのスタイルが正しく適用される", () => {
    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
        },
        {
          image_url: "https://picsum.photos/400/600?random=3",
          text: "3枚目",
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    const { container } = render(
      <PostCard post={multiSlidePost} onLike={onLike} onClick={onClick} autoPlayInterval={3000} />
    );

    // プログレスバーのコンテナを取得
    const progressBars = container.querySelectorAll(".h-1.flex-1 > div");
    expect(progressBars).toHaveLength(3);

    // 1つ目（アクティブ）: w-0 + animate-[progress-bar_linear_forwards]
    expect(progressBars[0]).toHaveClass("w-0");
    expect(progressBars[0]).toHaveClass("animate-[progress-bar_linear_forwards]");

    // 2つ目（未表示）: w-0のみ
    expect(progressBars[1]).toHaveClass("w-0");
    expect(progressBars[1]).not.toHaveClass("w-full");

    // 3つ目（未表示）: w-0のみ
    expect(progressBars[2]).toHaveClass("w-0");
    expect(progressBars[2]).not.toHaveClass("w-full");
  });

  it("スライドを手動で切り替えたとき、プログレスバーが正しく更新される", async () => {
    const user = userEvent.setup();
    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
        },
        {
          image_url: "https://picsum.photos/400/600?random=3",
          text: "3枚目",
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    const { container } = render(
      <PostCard post={multiSlidePost} onLike={onLike} onClick={onClick} autoPlayInterval={3000} />
    );

    const nextButton = screen.getByLabelText("次のスライド");

    // 次のスライドへ移動
    await user.click(nextButton);

    const progressBars = container.querySelectorAll(".h-1.flex-1 > div");

    // 1つ目（完了）: w-fullに変化
    expect(progressBars[0]).toHaveClass("w-full");

    // 2つ目（アクティブ）: w-0 + animate-[progress-bar_linear_forwards]
    expect(progressBars[1]).toHaveClass("w-0");
    expect(progressBars[1]).toHaveClass("animate-[progress-bar_linear_forwards]");

    // 3つ目（未表示）: w-0のみ
    expect(progressBars[2]).toHaveClass("w-0");
    expect(progressBars[2]).not.toHaveClass("w-full");
  });

  it("プログレスバーのアニメーション時間が正しく設定される", () => {
    const autoPlayInterval = 5000;
    const multiSlidePost = {
      ...mockPost,
      slides: [
        {
          image_url: "https://picsum.photos/400/600?random=1",
          text: "1枚目",
        },
        {
          image_url: "https://picsum.photos/400/600?random=2",
          text: "2枚目",
        },
      ],
    };
    const onLike = vi.fn();
    const onClick = vi.fn();

    const { container } = render(
      <PostCard
        post={multiSlidePost}
        onLike={onLike}
        onClick={onClick}
        autoPlayInterval={autoPlayInterval}
      />
    );

    // プログレスバーのコンテナを取得
    const progressBars = container.querySelectorAll(".h-1.flex-1 > div");

    // 1つ目（アクティブ）のアニメーション時間を確認
    const activeProgressBar = progressBars[0] as HTMLElement;
    expect(activeProgressBar.style.animationDuration).toBe(`${autoPlayInterval}ms`);

    // 2つ目（未表示）はアニメーション時間が設定されていない
    const inactiveProgressBar = progressBars[1] as HTMLElement;
    expect(inactiveProgressBar.style.animationDuration).toBe("");
  });

  test("slidesが空の場合、デフォルト画像が表示される", () => {
    const mockPost = { id: 1, slides: [], user_id: 1, message: "No slides" };
    render(<PostCard post={mockPost} onLike={() => {}} onClick={() => {}} />);
    const fallbackImage = screen.getByAltText("No slides");
    expect(fallbackImage).toBeInTheDocument();
    // Next.js ImageがURLをエンコードするため、srcにplacehold.coが含まれていることを確認
    expect(fallbackImage.getAttribute("src")).toContain("placehold.co");
  });

  it("slidesプロパティが未定義の場合、デフォルト画像が表示される（slides === undefined をカバー）", () => {
    const mockPostNoSlides: Partial<GoShishaBackendInternalModelsPost> = {
      id: 2,
      user_id: 2,
      message: "No slides prop",
      // slides を意図的に含めない
    };

    render(
      // 型を合わせるため as unknown を経由
      <PostCard
        post={mockPostNoSlides as unknown as GoShishaBackendInternalModelsPost}
        onLike={() => {}}
        onClick={() => {}}
      />
    );

    const fallbackImage = screen.getByAltText("No slides prop");
    expect(fallbackImage).toBeInTheDocument();
    expect(fallbackImage.getAttribute("src")).toContain("placehold.co");
  });

  it("プログレスバーの完了/アクティブ/未表示状態が手動切替で正しく反映される", async () => {
    const user = userEvent.setup();
    const multiSlidePost = {
      ...mockPost,
      slides: [
        { image_url: "https://picsum.photos/400/600?random=1", text: "A1" },
        { image_url: "https://picsum.photos/400/600?random=2", text: "A2" },
        { image_url: "https://picsum.photos/400/600?random=3", text: "A3" },
      ],
    } as unknown as GoShishaBackendInternalModelsPost;

    const { container } = render(
      <PostCard
        post={multiSlidePost}
        onLike={() => {}}
        onClick={() => {}}
        autoPlayInterval={2000}
      />
    );

    // 初期は A1 が表示される
    expect(screen.getByText("A1")).toBeInTheDocument();

    // 次ボタンで A2 に切り替え
    const next = screen.getByLabelText("次のスライド");
    await user.click(next);

    // プログレスバー要素を取得して各状態を確認
    const progressBars = container.querySelectorAll(".h-1.flex-1 > div");
    const first = progressBars[0] as HTMLElement;
    const second = progressBars[1] as HTMLElement;
    const third = progressBars[2] as HTMLElement;

    // 1つ目は完了
    expect(first).toHaveClass("w-full");
    // 2つ目はアクティブ（アニメーションクラスがある）
    expect(second).toHaveClass("animate-[progress-bar_linear_forwards]");
    // 3つ目は未表示
    expect(third).toHaveClass("w-0");
  });
});
