import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@/test/utils";
import type { Post } from "@/types/domain";
import { useGetPostsId } from "../../../../api/posts";
import { PostDetail } from "./PostDetail";
import PostDetailCarousel from "./PostDetailCarousel";
import PostDetailHeader from "./PostDetailHeader";

// モック対象
vi.mock("../../../../api/posts", () => ({
  useGetPostsId: vi.fn(),
}));

// next/navigation をモックして useRouter().push を提供
let pushSpy = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy }),
}));

let onLikeSpy = vi.fn();
let onUnlikeSpy = vi.fn();
vi.mock("../../hooks/useLike", () => ({
  useLike: () => ({ onLike: onLikeSpy, onUnlike: onUnlikeSpy }),
}));

// next/image を簡易モックして jsdom 環境で <img> として扱う
vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => React.createElement("img", props),
  };
});

const mockPost: Post = {
  id: 11,
  user_id: 2,
  slides: [
    {
      image_url: "https://placehold.co/400x600",
      text: "スライドテキスト",
      flavor: { id: 1, name: "ミント" },
    },
  ],
  likes: 5,
  is_liked: false,
  user: {
    id: 2,
    display_name: "投稿者",
    email: "a@b",
    description: "",
    icon_url: "",
    external_url: "",
  },
};

describe("PostDetail", () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    vi.clearAllMocks();
    onLikeSpy = vi.fn();
    onUnlikeSpy = vi.fn();
    user = userEvent.setup();
  });

  test("PostDetail の内部 handleBack が動作する (history.back / location.href)", async () => {
    // history length > 1 -> history.back
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPost,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const backSpy = vi.fn();
    Object.defineProperty(window, "history", {
      value: { ...window.history, length: 2, back: backSpy },
      configurable: true,
    });

    render(<PostDetail postId={mockPost.id!} />);
    const backBtn = screen.getAllByRole("button", { name: /戻る/ })[0];
    await user.click(backBtn);
    expect(backSpy).toHaveBeenCalled();

    // unmount and test location href branch
    cleanup();
    Object.defineProperty(window, "history", {
      value: { ...window.history, length: 1, back: vi.fn() },
      configurable: true,
    });
    // router.push が呼ばれることを期待する
    pushSpy = vi.fn();

    render(<PostDetail postId={mockPost.id!} />);
    const backBtn2 = screen.getAllByRole("button", { name: /戻る/ })[0];
    await user.click(backBtn2);
    expect(pushSpy).toHaveBeenCalledWith("/");
  });
  test("エラー時に再試行ボタンが表示され refetch が呼ばれる", async () => {
    const refetch = vi.fn();
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    render(<PostDetail postId={11} />);
    expect(screen.getByText("投稿を取得できませんでした。")).toBeInTheDocument();

    await user.click(screen.getByText("再試行"));
    expect(refetch).toHaveBeenCalled();
  });

  test("data が undefined で isError が false のときも再試行UIが表示され refetch が呼ばれる", async () => {
    const refetch = vi.fn();
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch,
    });

    render(<PostDetail postId={123} />);
    expect(screen.getByText("投稿を取得できませんでした。")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText("再試行"));
    expect(refetch).toHaveBeenCalled();
  });

  test("ローディング時はスケルトンが表示される", () => {
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={11} />);
    // スケルトン要素が存在すること
    expect(document.querySelectorAll(".bg-gray-200").length).toBeGreaterThan(0);
  });

  test("slidesが空のとき No Image とシェア動作を確認", async () => {
    const clipboardWrite = vi.fn().mockResolvedValue(undefined);
    // define clipboard on navigator for jsdom
    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText: clipboardWrite },
      configurable: true,
    });
    (globalThis as unknown as { alert?: (message?: string) => void }).alert = vi.fn();

    const refetch = vi.fn();
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { id: 2, slides: [], user_id: 1, likes: 0 },
      isLoading: false,
      isError: false,
      refetch,
    });

    render(<PostDetail postId={2} />);

    expect(screen.getByText("No Image")).toBeInTheDocument();

    // シェアボタンをクリックして clipboard.writeText と alert が呼ばれる
    const shareBtn = screen.getByRole("button", { name: /シェア/ });
    await userEvent.click(shareBtn);
    expect(clipboardWrite).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith("URLをコピーしました");
  });

  test("複数スライド時に Prev/Next ボタンで画像が切り替わる", async () => {
    const multi = {
      id: 3,
      slides: [
        { image_url: "a.jpg", text: "S1", flavor: undefined },
        { image_url: "b.jpg", text: "S2", flavor: { id: 5, name: "ベリー" } },
      ],
      user_id: 1,
      likes: 0,
    } as unknown as Post;

    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: multi,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={3} />);

    expect(screen.getByText("S1")).toBeInTheDocument();

    const next = screen.getByLabelText("次のスライド");
    await userEvent.click(next);
    expect(screen.getByText("S2")).toBeInTheDocument();

    const prev = screen.getByLabelText("前のスライド");
    await userEvent.click(prev);
    expect(screen.getByText("S1")).toBeInTheDocument();
  });

  test("投稿表示といいね動作（onLike/onUnlikeが呼ばれる）", async () => {
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPost,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={mockPost.id!} />);

    // 投稿内容の表示
    expect(screen.getByText("投稿者")).toBeInTheDocument();
    expect(screen.getByText("スライドテキスト")).toBeInTheDocument();

    // 初期いいね数
    expect(screen.getByText(String(mockPost.likes ?? 0))).toBeInTheDocument();

    // いいね押下 -> optimistic update と onLike 呼び出し
    const countNode = screen.getByText(String(mockPost.likes ?? 0));
    const likeBtn = countNode.closest("button");
    if (!likeBtn) throw new Error("like button not found");
    await user.click(likeBtn);

    expect(onLikeSpy).toHaveBeenCalledWith(mockPost.id);
    // optimisticLikes が増えていることを確認
    expect(screen.getByText(String((mockPost.likes ?? 0) + 1))).toBeInTheDocument();

    // 再度クリック -> unlike
    await user.click(likeBtn);
    expect(onUnlikeSpy).toHaveBeenCalledWith(mockPost.id);
    expect(screen.getByText(String(mockPost.likes ?? 0))).toBeInTheDocument();
  });

  test("ドットページネーションのボタンをクリックすると該当スライドに切り替わる", async () => {
    const multi = {
      id: 4,
      slides: [
        { image_url: "a.jpg", text: "D1", flavor: undefined },
        { image_url: "b.jpg", text: "D2", flavor: undefined },
        { image_url: "c.jpg", text: "D3", flavor: undefined },
      ],
      user_id: 1,
      likes: 0,
    } as unknown as Post;

    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: multi,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={4} />);

    expect(screen.getByText("D1")).toBeInTheDocument();

    const dot2 = screen.getByRole("button", { name: /スライド 2/ });
    await userEvent.click(dot2);
    expect(screen.getByText("D2")).toBeInTheDocument();
  });

  test("ドットの aria-current が切り替わることを確認する", async () => {
    const multi = {
      id: 10,
      slides: [
        { image_url: "a.jpg", text: "D1", flavor: undefined },
        { image_url: "b.jpg", text: "D2", flavor: undefined },
      ],
      user_id: 1,
      likes: 0,
    } as unknown as Post;

    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: multi,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={10} />);

    const dot1 = screen.getByRole("button", { name: /スライド 1/ });
    const dot2 = screen.getByRole("button", { name: /スライド 2/ });

    // 初期は dot1 がアクティブ
    expect(dot1).toHaveAttribute("aria-current", "true");
    expect(dot2).not.toHaveAttribute("aria-current", "true");

    await userEvent.click(dot2);

    // dot2 がアクティブに切り替わる
    expect(dot2).toHaveAttribute("aria-current", "true");
    expect(dot1).not.toHaveAttribute("aria-current", "true");
  });

  test("initialPost が優先されて optimisticLikes / isLiked が初期化される", () => {
    const initialPost = {
      id: 99,
      likes: 10,
      is_liked: true,
      user_id: 1,
    } as unknown as Post;

    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { id: 99, likes: 0, is_liked: false } as Post,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={99} initialPost={initialPost} />);

    // optimisticLikes が initialPost の likes を使っている
    expect(screen.getByText(String(initialPost.likes))).toBeInTheDocument();
  });

  test("post.id が undefined のときいいね操作は何もしない", async () => {
    const user = userEvent.setup();
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { id: undefined, likes: 0 } as unknown as Post,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={0} />);

    const likeBtn = screen.getByRole("button", { pressed: false });
    await user.click(likeBtn);

    expect(onLikeSpy).not.toHaveBeenCalled();
    expect(onUnlikeSpy).not.toHaveBeenCalled();
  });

  test("ユーザー名がない場合、匿名が表示される", () => {
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 2,
        likes: 0,
        user: undefined,
      } as unknown as Post,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PostDetail postId={2} />);

    expect(screen.getByText("匿名")).toBeInTheDocument();
  });

  test("戻るボタンで history.back が呼ばれる / location.href が設定されるパス", async () => {
    // case: history length > 1 -> history.back
    const refetch = vi.fn();
    (useGetPostsId as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPost,
      isLoading: false,
      isError: false,
      refetch,
    });

    const origHistory = window.history;
    const origLocation = window.location;

    // mock history with length > 1 and test PostDetailHeader's back button
    const backSpy = vi.fn();
    Object.defineProperty(window, "history", {
      value: { ...window.history, length: 2, back: backSpy },
      configurable: true,
    });

    render(
      <PostDetailHeader
        user={mockPost.user}
        createdAt={mockPost.created_at}
        onBack={() => window.history.back()}
      />
    );
    const headerBack = screen.getByRole("button", { name: /戻る/ });
    await userEvent.click(headerBack);
    expect(backSpy).toHaveBeenCalled();

    // case: history length <= 1 -> location.href = '/'
    // unmount previous render to avoid duplicate buttons in the document
    cleanup();
    Object.defineProperty(window, "history", {
      value: { ...window.history, length: 1, back: vi.fn() },
      configurable: true,
    });
    // make location writable and observe assignment
    const hrefObj: { href: string } = { href: "" };
    Object.defineProperty(window, "location", { value: hrefObj, configurable: true });

    render(
      <PostDetailCarousel
        slides={[]}
        current={0}
        onPrev={() => {}}
        onNext={() => {}}
        onDotClick={() => {}}
        handleBack={() => (window.location.href = "/")}
      />
    );
    const carouselBack = screen.getByRole("button", { name: /戻る/ });
    await userEvent.click(carouselBack);
    expect(window.location.href).toBe("/");

    // restore
    Object.defineProperty(window, "history", { value: origHistory, configurable: true });
    Object.defineProperty(window, "location", { value: origLocation, configurable: true });
  });
});
