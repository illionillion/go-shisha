import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/utils";
import type { Post, Flavor } from "@/types/domain";
import { useGetPosts } from "../../../../api/posts";
import { useGetUsersIdPosts } from "../../../../api/users";
import type { TimelineProps } from "./Timeline";
import { TimelineContainer } from "./TimelineContainer";

// --- Timelineモック（型安全・テスト用props拡張） ---
vi.mock("./Timeline", () => ({
  Timeline: (props: TimelineProps) => {
    // isLoadingやerrorが設定されている場合は、それらを優先表示
    if (props.isLoading) {
      return (
        <div data-testid="timeline-mock">
          <div>isLoading:true</div>
        </div>
      );
    }
    if (props.error) {
      return (
        <div data-testid="timeline-mock">
          <div>error:true</div>
        </div>
      );
    }
    // 投稿が空の場合
    if (props.posts?.length === 0) {
      return (
        <div data-testid="timeline-mock">
          <div>posts:0</div>
          <p className="text-center text-gray-500">投稿がありません</p>
        </div>
      );
    }
    // 通常の表示
    return (
      <div data-testid="timeline-mock">
        <div>posts:{props.posts?.length}</div>
        <div>isLoading:{String(props.isLoading)}</div>
        <div>error:{props.error ? "true" : ""}</div>
        <div>availableFlavors:{props.availableFlavors?.length}</div>
        <div>selectedFlavorIds:{props.selectedFlavorIds?.join(",")}</div>
        {/* filteredPosts/handleFlavorToggleテスト用 */}
        {props.onFlavorToggle && (
          <>
            <button onClick={() => props.onFlavorToggle?.(10)}>toggle10</button>
            <button onClick={() => props.onFlavorToggle?.(20)}>toggle20</button>
            <div data-testid="selected">{props.selectedFlavorIds?.join(",")}</div>
            <div data-testid="posts">{props.posts?.map((p: Post) => p.id).join(",")}</div>
          </>
        )}
      </div>
    );
  },
}));

// --- useGetPostsモック ---
vi.mock("../../../../api/posts", () => ({
  useGetPosts: vi.fn(),
}));

// --- useGetUsersIdPosts モック（userId パスの検証用） ---
vi.mock("../../../../api/users", () => ({
  useGetUsersIdPosts: vi.fn(),
}));

// --- useLike モック (QueryClientProvider がテストにないため) ---
vi.mock("../../hooks/useLike", () => ({
  useLike: () => ({ onLike: vi.fn(), onUnlike: vi.fn() }),
}));

const mockFlavors: Flavor[] = [
  { id: 10, name: "ミント" },
  { id: 20, name: "レモン" },
];

const mockPosts: Post[] = [
  {
    id: 1,
    slides: [
      {
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mint",
        text: "ミント系のシーシャ",
        flavor: mockFlavors[0],
      },
    ],
    user_id: 1,
  },
  {
    id: 2,
    slides: [
      {
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Lemon",
        text: "レモン系のシーシャ",
        flavor: mockFlavors[1],
      },
    ],
    user_id: 2,
  },
];

describe("TimelineContainer", () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    vi.resetAllMocks();
    user = userEvent.setup();
  });

  test("SSR: initialPostsありの場合、SSRデータが正しくTimelineに渡る（isLoadingはfalse）", () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    render(<TimelineContainer initialPosts={mockPosts} />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("posts:2");
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("isLoading:false");
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("availableFlavors:2");
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("selectedFlavorIds:");
  });

  test("CSR: initialPostsなしでローディング時はisLoading:trueが渡る", () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<TimelineContainer />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("isLoading:true");
  });

  test("CSR: データ取得後はposts/availableFlavorsが正しく渡る", () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { posts: mockPosts },
      isLoading: false,
      error: null,
    });
    render(<TimelineContainer />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("posts:2");
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("availableFlavors:2");
  });

  test("CSR: エラー時はerrorが正しくTimelineに渡る", () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "err" },
    });
    render(<TimelineContainer />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("error:true");
  });

  test("ガード: posts/flavorが空・異常値でもクラッシュしない", () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    // posts: 空配列
    const { unmount } = render(<TimelineContainer initialPosts={[]} />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("posts:0");
    unmount();
    // posts: slides配列が空
    const postsWithEmptySlides: Post[] = [
      {
        id: 1,
        slides: [],
        user_id: 99,
      },
    ];
    render(<TimelineContainer initialPosts={postsWithEmptySlides} />);
    expect(screen.getAllByTestId("timeline-mock").length).toBeGreaterThan(0);
  });

  test("スライド内の flavor が undefined の場合、availableFlavors 抽出で無視される", () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const postsWithUndefinedFlavor: Post[] = [
      {
        id: 10,
        slides: [
          { image_url: "a.jpg", text: "t1", flavor: undefined },
          { image_url: "b.jpg", text: "t2", flavor: { id: 99, name: "特異" } },
        ],
        user_id: 5,
      },
    ];

    render(<TimelineContainer initialPosts={postsWithUndefinedFlavor} />);
    // availableFlavors は flavor が定義されているもののみ抽出される
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("availableFlavors:1");
  });

  test("filteredPosts/handleFlavorToggle: flavor選択で絞り込み・トグル動作が正しい", async () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { posts: mockPosts },
      isLoading: false,
      error: null,
    });
    render(<TimelineContainer />);
    // 初期状態: selectedFlavorIdsなし→全件
    expect(screen.getByTestId("posts")).toHaveTextContent("1,2");
    // 10を選択
    await user.click(screen.getByText("toggle10"));
    expect(screen.getByTestId("selected")).toHaveTextContent("10");
    expect(screen.getByTestId("posts")).toHaveTextContent("1");
    // 20を選択
    await user.click(screen.getByText("toggle20"));
    expect(screen.getByTestId("selected")).toHaveTextContent("10,20");
    expect(screen.getByTestId("posts")).toHaveTextContent("1,2");
    // 10を再度クリックで解除
    await user.click(screen.getByText("toggle10"));
    expect(screen.getByTestId("selected")).toHaveTextContent("20");
    expect(screen.getByTestId("posts")).toHaveTextContent("2");
  });

  test("initialPostsが空の場合、タイムラインが空であることを表示", () => {
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    render(<TimelineContainer initialPosts={[]} />);
    expect(screen.getByText("投稿がありません")).toBeInTheDocument();
  });

  test("userId 指定時は useGetUsersIdPosts が使われ、useGetPosts は disabled になる", () => {
    const usersMock = useGetUsersIdPosts as ReturnType<typeof vi.fn>;
    (usersMock as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { posts: [mockPosts[0]] },
      isLoading: false,
      error: null,
    });

    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<TimelineContainer userId={1} />);

    // users hook が userId で呼ばれている
    expect((usersMock as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(1);

    // posts hook の enabled が false になっていることを確認
    const postsCallArg = (useGetPosts as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(postsCallArg.query?.enabled).toBe(false);

    // Timeline が usersHook の投稿を表示している
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("posts:1");
  });

  test("userId 指定時に loading 状態は usersHook の isLoading を反映する", () => {
    const usersMock = useGetUsersIdPosts as ReturnType<typeof vi.fn>;
    (usersMock as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<TimelineContainer userId={2} />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("isLoading:true");
  });

  test("userId 指定時に error 状態は usersHook の error を反映する", () => {
    const usersMock = useGetUsersIdPosts as ReturnType<typeof vi.fn>;
    (usersMock as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "err" },
    });
    (useGetPosts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<TimelineContainer userId={3} />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("error:true");
  });
});
