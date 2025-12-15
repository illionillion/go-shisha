import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import type {
  GoShishaBackendInternalModelsPost,
  GoShishaBackendInternalModelsFlavor,
} from "../../../api/model";
import { useGetPosts } from "../../../api/posts";
import type { TimelineProps } from "./Timeline";
import { TimelineContainer } from "./TimelineContainer";

// --- Timelineモック（型安全・テスト用props拡張） ---
vi.mock("./Timeline", () => ({
  Timeline: (props: TimelineProps) => (
    <div data-testid="timeline-mock">
      <div>posts:{props.posts?.length}</div>
      <div>isLoading:{String(props.isLoading)}</div>
      <div>error:{props.error ? "true" : ""}</div>
      <div>availableFlavors:{props.availableFlavors?.length}</div>
      <div>selectedFlavorIds:{props.selectedFlavorIds?.join(",")}</div>
      {/* filteredPosts/handleFlavorToggleテスト用 */}
      {props.onFlavorToggle && (
        <>
          <button onClick={() => props.onFlavorToggle && props.onFlavorToggle(10)}>toggle10</button>
          <button onClick={() => props.onFlavorToggle && props.onFlavorToggle(20)}>toggle20</button>
          <div data-testid="selected">{props.selectedFlavorIds?.join(",")}</div>
          <div data-testid="posts">{props.posts?.map((p) => p.id).join(",")}</div>
        </>
      )}
    </div>
  ),
}));

// --- useGetPostsモック ---
vi.mock("../../../api/posts", () => ({
  useGetPosts: vi.fn(),
}));

const mockFlavors: GoShishaBackendInternalModelsFlavor[] = [
  { id: 10, name: "ミント" },
  { id: 20, name: "レモン" },
];

const mockPosts: GoShishaBackendInternalModelsPost[] = [
  {
    id: 1,
    flavor_id: 10,
    flavor: mockFlavors[0],
    user_id: 1,
    // 必須フィールドを全て埋める
  },
  {
    id: 2,
    flavor_id: 20,
    flavor: mockFlavors[1],
    user_id: 2,
  },
];

describe("TimelineContainer", () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  test("SSR: initialPostsありの場合、SSRデータが正しくTimelineに渡る", () => {
    (useGetPosts as unknown as jest.Mock).mockReturnValue({
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
    (useGetPosts as unknown as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<TimelineContainer />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("isLoading:true");
  });

  test("CSR: データ取得後はposts/availableFlavorsが正しく渡る", () => {
    (useGetPosts as unknown as jest.Mock).mockReturnValue({
      data: { posts: mockPosts },
      isLoading: false,
      error: null,
    });
    render(<TimelineContainer />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("posts:2");
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("availableFlavors:2");
  });

  test("CSR: エラー時はerrorが正しくTimelineに渡る", () => {
    (useGetPosts as unknown as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "err" },
    });
    render(<TimelineContainer />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("error:true");
  });

  test("ガード: posts/flavorが空・異常値でもクラッシュしない", () => {
    (useGetPosts as unknown as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    // posts: 空配列
    const { unmount } = render(<TimelineContainer initialPosts={[]} />);
    expect(screen.getByTestId("timeline-mock")).toHaveTextContent("posts:0");
    unmount();
    // posts: flavorがundefined
    const postsWithUndefinedFlavor: GoShishaBackendInternalModelsPost[] = [
      {
        id: 1,
        flavor_id: 1,
        flavor: undefined,
        user_id: 99,
      },
    ];
    render(<TimelineContainer initialPosts={postsWithUndefinedFlavor} />);
    expect(screen.getAllByTestId("timeline-mock").length).toBeGreaterThan(0);
  });

  test("filteredPosts/handleFlavorToggle: flavor選択で絞り込み・トグル動作が正しい", async () => {
    (useGetPosts as unknown as jest.Mock).mockReturnValue({
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
});
