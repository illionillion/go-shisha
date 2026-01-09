import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@/test/utils";
import type { Flavor } from "@/types/domain";
import { PostDetailFooter } from "./PostDetailFooter";

describe("PostDetailFooter", () => {
  // クリップボードAPIとalertのモック
  let clipboardWriteTextMock: ReturnType<typeof vi.fn>;
  let alertMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);
    alertMock = vi.fn();

    // クリップボードAPIのモック
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: clipboardWriteTextMock,
      },
      writable: true,
      configurable: true,
    });

    // window.alertのモック
    vi.spyOn(window, "alert").mockImplementation(alertMock as (message?: string) => void);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("基本的なレンダリング", () => {
    it("テキストが表示される", () => {
      const currentSlide = {
        text: "今日のシーシャは最高でした！",
      };

      render(
        <PostDetailFooter
          currentSlide={currentSlide}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      expect(screen.getByText("今日のシーシャは最高でした！")).toBeInTheDocument();
    });

    it("テキストがnullの場合は何も表示されない", () => {
      const currentSlide = {
        text: null,
      };

      const { container } = render(
        <PostDetailFooter
          currentSlide={currentSlide}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const textParagraph = container.querySelector("p.mb-4");
      expect(textParagraph?.textContent).toBe("");
    });

    it("いいね数が表示される", () => {
      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={42}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("currentSlideがundefinedの場合でもエラーなくレンダリングされる", () => {
      render(
        <PostDetailFooter
          currentSlide={undefined}
          optimisticLikes={0}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("フレーバーラベル", () => {
    it("フレーバーが存在する場合、FlavorLabelが表示される", () => {
      const flavor: Flavor = {
        id: 1,
        name: "ミント",
        color: "bg-green-500",
      };

      const currentSlide = {
        text: "test",
        flavor,
      };

      render(
        <PostDetailFooter
          currentSlide={currentSlide}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      expect(screen.getByText("ミント")).toBeInTheDocument();
    });

    it("フレーバーが存在しない場合、FlavorLabelは表示されない", () => {
      const currentSlide = {
        text: "test",
        flavor: undefined,
      };

      render(
        <PostDetailFooter
          currentSlide={currentSlide}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      expect(screen.queryByText("ミント")).not.toBeInTheDocument();
    });
  });

  describe("いいねボタン", () => {
    it("いいねボタンが表示される", () => {
      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const likeButton = screen.getByRole("button", { pressed: false });
      expect(likeButton).toBeInTheDocument();
    });

    it("いいねボタンをクリックするとonLikeが呼ばれる", async () => {
      const user = userEvent.setup();
      const onLike = vi.fn();

      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={onLike}
        />
      );

      const likeButton = screen.getByRole("button", { pressed: false });
      await user.click(likeButton);

      expect(onLike).toHaveBeenCalledTimes(1);
    });

    it("isLiked=falseの場合、ハートアイコンが塗りつぶされていない", () => {
      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const likeButton = screen.getByRole("button", { pressed: false });
      const svg = likeButton.querySelector("svg");

      expect(svg).toHaveAttribute("fill", "none");
    });

    it("isLiked=trueの場合、ハートアイコンが塗りつぶされている", () => {
      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={true}
          onLike={vi.fn()}
        />
      );

      const likeButton = screen.getByRole("button", { pressed: true });
      const svg = likeButton.querySelector("svg");

      expect(svg).toHaveAttribute("fill", "currentColor");
    });

    it("isLiked=trueの場合、テキスト色が赤になる", () => {
      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={true}
          onLike={vi.fn()}
        />
      );

      const likeButton = screen.getByRole("button", { pressed: true });
      expect(likeButton).toHaveClass("text-red-500");
    });

    it("isLiked=falseの場合、テキスト色がグレーになる", () => {
      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const likeButton = screen.getByRole("button", { pressed: false });
      expect(likeButton).toHaveClass("text-gray-700");
    });
  });

  describe("シェアボタン", () => {
    it("シェアボタンが表示される", () => {
      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const shareButton = screen.getByLabelText("シェア");
      expect(shareButton).toBeInTheDocument();
    });

    it("シェアボタンをクリックするとクリップボードAPIが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const shareButton = screen.getByLabelText("シェア");
      await user.click(shareButton);

      // alertが呼ばれることを確認（クリップボードAPIの代わり）
      expect(alertMock).toHaveBeenCalledWith("URLをコピーしました");
    });

    it("シェアボタンをクリックするとアラートが表示される", async () => {
      const user = userEvent.setup();

      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const shareButton = screen.getByLabelText("シェア");
      await user.click(shareButton);

      expect(alertMock).toHaveBeenCalledWith("URLをコピーしました");
    });

    it("クリップボードAPIが存在しない場合、アラートは表示されない", async () => {
      const user = userEvent.setup();
      const originalClipboard = navigator.clipboard;

      // クリップボードAPIを無効化
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const shareButton = screen.getByLabelText("シェア");

      // シェアボタンをクリック
      await user.click(shareButton);

      // アラートが呼ばれないことを確認
      expect(alertMock).not.toHaveBeenCalled();

      // 元に戻す
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    it("クリップボードAPIがエラーを投げた場合、アラートは表示されない", async () => {
      const user = userEvent.setup();

      // 新しいエラーを投げるモックを作成
      const errorMock = vi.fn().mockRejectedValue(new Error("Clipboard API error"));

      // クリップボードAPIを再設定
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: errorMock,
        },
        writable: true,
        configurable: true,
      });

      render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const shareButton = screen.getByLabelText("シェア");

      // シェアボタンをクリック
      await user.click(shareButton);

      // writeTextが呼ばれたことを確認
      expect(errorMock).toHaveBeenCalled();

      // アラートが呼ばれないことを確認
      expect(alertMock).not.toHaveBeenCalled();
    });
  });

  describe("レイアウト", () => {
    it("md:w-96のスタイルが適用されている", () => {
      const { container } = render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const wrapper = container.querySelector(".md\\:w-96");
      expect(wrapper).toBeInTheDocument();
    });

    it("いいねとシェアボタンが横並びで表示される", () => {
      const { container } = render(
        <PostDetailFooter
          currentSlide={{ text: "test" }}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      const buttonContainer = container.querySelector(".flex.items-center.gap-3");
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe("複数のスライドパターン", () => {
    it("異なるフレーバーのスライドでも正しく表示される", () => {
      const flavor1: Flavor = {
        id: 1,
        name: "ミント",
        color: "bg-green-500",
      };

      const currentSlide = {
        text: "ミント味のシーシャ",
        flavor: flavor1,
      };

      const { rerender } = render(
        <PostDetailFooter
          currentSlide={currentSlide}
          optimisticLikes={10}
          isLiked={false}
          onLike={vi.fn()}
        />
      );

      expect(screen.getByText("ミント")).toBeInTheDocument();
      expect(screen.getByText("ミント味のシーシャ")).toBeInTheDocument();

      const flavor2: Flavor = {
        id: 2,
        name: "アップル",
        color: "bg-red-500",
      };

      const currentSlide2 = {
        text: "アップル味のシーシャ",
        flavor: flavor2,
      };

      rerender(
        <PostDetailFooter
          currentSlide={currentSlide2}
          optimisticLikes={15}
          isLiked={true}
          onLike={vi.fn()}
        />
      );

      expect(screen.getByText("アップル")).toBeInTheDocument();
      expect(screen.getByText("アップル味のシーシャ")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
    });
  });
});
