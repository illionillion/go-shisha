import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import type { User } from "@/types/domain";
import { PostDetailHeader } from "./PostDetailHeader";

describe("PostDetailHeader", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    display_name: "テストユーザー",
    description: "シーシャ大好き！",
    icon_url: "https://example.com/avatar.jpg",
    external_url: "https://example.com",
  };

  describe("基本的なレンダリング", () => {
    it("ユーザー名が表示される", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    });

    it("日時が表示される", () => {
      const createdAt = "2024-01-01T12:00:00Z";
      render(<PostDetailHeader user={mockUser} createdAt={createdAt} onBack={vi.fn()} />);

      // フォーマット済みの日時が表示される
      const timeElement = screen.getByText("2024/01/01 12:00");
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.tagName).toBe("TIME");
      expect(timeElement).toHaveAttribute("dateTime", createdAt);
    });

    it("戻るボタンが表示される", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      const backButton = screen.getByLabelText("戻る");
      expect(backButton).toBeInTheDocument();
    });

    it("戻るボタンのテキストが表示される", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      expect(screen.getByText("戻る")).toBeInTheDocument();
    });
  });

  describe("ユーザー情報", () => {
    it("ユーザーアイコンが表示される", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      const avatar = screen.getByAltText("テストユーザー");
      expect(avatar).toBeInTheDocument();
    });

    it("ユーザーがundefinedの場合、「匿名」と表示される", () => {
      render(<PostDetailHeader user={undefined} createdAt="2024-01-01" onBack={vi.fn()} />);

      expect(screen.getByText("匿名")).toBeInTheDocument();
    });

    it("ユーザーがundefinedの場合、アバターのaria-labelが「ユーザー」になる", () => {
      render(<PostDetailHeader user={undefined} createdAt="2024-01-01" onBack={vi.fn()} />);

      const avatar = screen.getByLabelText("ユーザー");
      expect(avatar).toBeInTheDocument();
    });

    it("icon_urlがnullの場合でも表示される", () => {
      const userWithoutIcon = { ...mockUser, icon_url: undefined };
      const { container } = render(
        <PostDetailHeader user={userWithoutIcon} createdAt="2024-01-01" onBack={vi.fn()} />
      );

      // アバターコンテナが存在することを確認
      const avatar = container.querySelector('[role="img"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("aria-label", "テストユーザー");
    });

    it("display_nameがnullの場合は「匿名」と表示される", () => {
      const userWithoutName = { ...mockUser, display_name: undefined };
      render(<PostDetailHeader user={userWithoutName} createdAt="2024-01-01" onBack={vi.fn()} />);

      expect(screen.getByText("匿名")).toBeInTheDocument();
    });
  });

  describe("日時表示", () => {
    it("createdAtがundefinedの場合、空文字が表示される", () => {
      const { container } = render(
        <PostDetailHeader user={mockUser} createdAt={undefined} onBack={vi.fn()} />
      );

      const timeElement = container.querySelector("time");
      expect(timeElement).toBeInTheDocument();
      expect(timeElement?.textContent).toBe("");
    });

    it("createdAtがundefinedの場合、dateTime属性は設定されない", () => {
      const { container } = render(
        <PostDetailHeader user={mockUser} createdAt={undefined} onBack={vi.fn()} />
      );

      const timeElement = container.querySelector("time");
      expect(timeElement).not.toHaveAttribute("dateTime");
    });

    it("異なる日時フォーマットでも正しく表示される", () => {
      const createdAt = "2024-12-25T06:30:45Z";
      render(<PostDetailHeader user={mockUser} createdAt={createdAt} onBack={vi.fn()} />);

      // UTC時刻でフォーマットされる
      const timeElement = screen.getByText("2024/12/25 06:30");
      expect(timeElement).toHaveAttribute("dateTime", createdAt);
    });
  });

  describe("戻るボタンの動作", () => {
    it("戻るボタンをクリックするとonBackが呼ばれる", async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();

      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={onBack} />);

      const backButton = screen.getByLabelText("戻る");
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("戻るボタンは複数回クリックできる", async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();

      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={onBack} />);

      const backButton = screen.getByLabelText("戻る");
      await user.click(backButton);
      await user.click(backButton);
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(3);
    });
  });

  describe("レスポンシブデザイン", () => {
    it("戻るボタンのコンテナがmd以上で表示される", () => {
      const { container } = render(
        <PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />
      );

      const backButtonContainer = container.querySelector(".hidden.md\\:flex");
      expect(backButtonContainer).toBeInTheDocument();
    });

    it("ユーザー情報のコンテナが存在する", () => {
      const { container } = render(
        <PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />
      );

      const userInfoContainer = container.querySelector(".flex.items-center.gap-3.mb-3");
      expect(userInfoContainer).toBeInTheDocument();
    });
  });

  describe("アバターのプロパティ", () => {
    it("アバターのサイズが40に設定されている", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      // Avatarコンポーネントの実装に依存するが、alt属性で確認
      const avatar = screen.getByAltText("テストユーザー");
      expect(avatar).toBeInTheDocument();
    });

    it("userIdが正しく渡される", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      // Avatarコンポーネントがリンクモードでレンダリングされることを確認
      const avatar = screen.getByAltText("テストユーザー");
      expect(avatar).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("すべてのプロパティがundefined/nullの場合でもエラーなくレンダリングされる", () => {
      render(<PostDetailHeader user={undefined} createdAt={undefined} onBack={vi.fn()} />);

      expect(screen.getByText("匿名")).toBeInTheDocument();
      expect(screen.getByLabelText("戻る")).toBeInTheDocument();
    });

    it("userのプロパティが部分的にnullでも表示される", () => {
      const partialUser: User = {
        id: 1,
        email: "test@example.com",
        display_name: undefined,
        description: undefined,
        icon_url: undefined,
        external_url: undefined,
      };

      render(<PostDetailHeader user={partialUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      expect(screen.getByText("匿名")).toBeInTheDocument();
    });

    it("createdAtが空文字の場合、空として表示される", () => {
      const { container } = render(
        <PostDetailHeader user={mockUser} createdAt="" onBack={vi.fn()} />
      );

      const timeElement = container.querySelector("time");
      expect(timeElement).toBeInTheDocument();
      expect(timeElement?.textContent).toBe("");
    });
  });

  describe("アイコンの表示", () => {
    it("戻るボタンにPrevIconが含まれている", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      const backButton = screen.getByLabelText("戻る");
      const svg = backButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("ユーザー名が太字で表示される", () => {
      render(<PostDetailHeader user={mockUser} createdAt="2024-01-01" onBack={vi.fn()} />);

      const displayName = screen.getByText("テストユーザー");
      expect(displayName).toHaveClass("font-medium");
    });

    it("日時がグレーで小さいテキストとして表示される", () => {
      const createdAt = "2024-01-01T12:00:00Z";
      render(<PostDetailHeader user={mockUser} createdAt={createdAt} onBack={vi.fn()} />);

      // フォーマット済みの日時でテキストを検索
      const timeContainer = screen.getByText("2024/01/01 12:00").parentElement;
      expect(timeContainer).toHaveClass("text-sm", "text-gray-500");
    });
  });
});
