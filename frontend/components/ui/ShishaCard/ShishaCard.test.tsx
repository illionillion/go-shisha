import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { ShishaCard, type ShishaCardProps } from "./ShishaCard";

/**
 * ShishaCardコンポーネントのユニットテスト
 */
describe("ShishaCardコンポーネント", () => {
  const defaultProps: ShishaCardProps = {
    imageUrl: "https://placehold.co/300x400/CCCCCC/666666?text=Shisha",
    message: "今日のシーシャは最高でした！フルーツミックスの味が絶妙で、煙もたっぷり楽しめました。",
    likes: 42,
    user: {
      displayName: "山田太郎",
      iconUrl: "https://placehold.co/40/4A90E2/FFFFFF?text=YT",
    },
    variant: "default",
  };

  describe("基本レンダリング", () => {
    test("デフォルトpropsで正常にレンダリングされる", () => {
      render(<ShishaCard {...defaultProps} />);

      // 画像が表示される
      const image = screen.getByAltText("山田太郎さんの投稿画像");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", expect.stringContaining("placehold.co"));

      // メッセージが表示される
      expect(
        screen.getByText(
          "今日のシーシャは最高でした！フルーツミックスの味が絶妙で、煙もたっぷり楽しめました。"
        )
      ).toBeInTheDocument();

      // いいね数が表示される
      expect(screen.getByText("42")).toBeInTheDocument();

      // ユーザー名が表示される
      expect(screen.getByText("山田太郎")).toBeInTheDocument();
    });

    test("variant='compact' でコンパクト表示になる", () => {
      const { container } = render(<ShishaCard {...defaultProps} variant="compact" />);

      // コンパクトバリアントのクラスが適用される
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("max-w-xs");
    });
  });

  describe("ユーザー操作", () => {
    test("onClick が設定されている場合、クリックでハンドラが呼ばれる", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<ShishaCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole("button");
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("onClick が設定されている場合、Enterキーでハンドラが呼ばれる", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<ShishaCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole("button");
      card.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("onClick が設定されている場合、Spaceキーでハンドラが呼ばれる", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<ShishaCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole("button");
      card.focus();
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("エッジケース", () => {
    test("ユーザーアイコンが未設定の場合、デフォルトアイコンが表示される", () => {
      const propsWithoutIcon = {
        ...defaultProps,
        user: { displayName: "佐藤花子" },
      };

      render(<ShishaCard {...propsWithoutIcon} />);

      // デフォルトアイコン（頭文字）が表示される
      expect(screen.getByText("佐")).toBeInTheDocument();
    });

    test("いいね数が0の場合も正しく表示される", () => {
      render(<ShishaCard {...defaultProps} likes={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    test("大きないいね数がカンマ区切りで表示される", () => {
      render(<ShishaCard {...defaultProps} likes={123456} />);

      expect(screen.getByText("123,456")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    test("onClick が設定されている場合、role='button' が設定される", () => {
      render(<ShishaCard {...defaultProps} onClick={vi.fn()} />);

      const card = screen.getByRole("button");
      expect(card).toBeInTheDocument();
    });

    test("onClick が設定されている場合、適切な aria-label が設定される", () => {
      render(<ShishaCard {...defaultProps} onClick={vi.fn()} />);

      const card = screen.getByRole("button");
      expect(card).toHaveAttribute(
        "aria-label",
        "山田太郎さんの投稿: 今日のシーシャは最高でした！フルーツミックスの味が絶妙で、煙もたっぷり楽しめました。"
      );
    });

    test("onClick が設定されている場合、tabIndex が 0 に設定される", () => {
      render(<ShishaCard {...defaultProps} onClick={vi.fn()} />);

      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    test("onClick が未設定の場合、role='button' が設定されない", () => {
      render(<ShishaCard {...defaultProps} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
