import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/utils";
import { PostOwnerMenu } from "./PostOwnerMenu";

describe("PostOwnerMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("基本的なレンダリング", () => {
    it("メニューボタンが表示される", () => {
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      expect(screen.getByLabelText("メニュー")).toBeInTheDocument();
    });

    it("初期状態では削除ボタンが表示されない", () => {
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      expect(screen.queryByText("削除")).not.toBeInTheDocument();
    });

    it("aria-expandedの初期値がfalseである", () => {
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      expect(screen.getByLabelText("メニュー")).toHaveAttribute("aria-expanded", "false");
    });

    it("メニューボタンにaria-haspopupが設定されている", () => {
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      expect(screen.getByLabelText("メニュー")).toHaveAttribute("aria-haspopup", "true");
    });
  });

  describe("メニュー開閉", () => {
    it("メニューボタンをクリックするとrole='menu'のコンテナが表示される", async () => {
      const user = userEvent.setup();
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("メニュー"));

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("メニューを開くとrole='menuitem'の削除ボタンが表示される", async () => {
      const user = userEvent.setup();
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("メニュー"));

      expect(screen.getByRole("menuitem")).toBeInTheDocument();
    });

    it("メニューボタンをクリックすると削除ボタンが表示される", async () => {
      const user = userEvent.setup();
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("メニュー"));

      expect(screen.getByText("削除")).toBeInTheDocument();
    });

    it("メニューを開くとaria-expandedがtrueになる", async () => {
      const user = userEvent.setup();
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("メニュー"));

      expect(screen.getByLabelText("メニュー")).toHaveAttribute("aria-expanded", "true");
    });

    it("メニューを開いてから再度クリックすると閉じる", async () => {
      const user = userEvent.setup();
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("メニュー"));
      expect(screen.getByText("削除")).toBeInTheDocument();

      await user.click(screen.getByLabelText("メニュー"));
      expect(screen.queryByText("削除")).not.toBeInTheDocument();
    });

    it("ESCキーでメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("メニュー"));
      expect(screen.getByText("削除")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByText("削除")).not.toBeInTheDocument();
    });

    it("メニュー外クリックでメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <PostOwnerMenu onDelete={vi.fn()} />
          <button type="button">外部ボタン</button>
        </div>
      );

      await user.click(screen.getByLabelText("メニュー"));
      expect(screen.getByText("削除")).toBeInTheDocument();

      await user.click(screen.getByText("外部ボタン"));
      expect(screen.queryByText("削除")).not.toBeInTheDocument();
    });
  });

  describe("削除アクション", () => {
    it("「削除」をクリックするとonDeleteが1回だけ呼ばれる", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<PostOwnerMenu onDelete={onDelete} />);

      await user.click(screen.getByLabelText("メニュー"));
      await user.click(screen.getByText("削除"));

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("「削除」をクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<PostOwnerMenu onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("メニュー"));
      await user.click(screen.getByText("削除"));

      expect(screen.queryByText("削除")).not.toBeInTheDocument();
    });
  });

  describe("variant", () => {
    it("variant='detail'のとき、DotsVerticalIconが表示される", () => {
      render(<PostOwnerMenu onDelete={vi.fn()} variant="detail" />);

      const button = screen.getByLabelText("メニュー");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("variant='card'のとき、DotsHorizontalIconが表示される", () => {
      render(<PostOwnerMenu onDelete={vi.fn()} variant="card" />);

      const button = screen.getByLabelText("メニュー");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("classNameが渡された場合、ラッパーdivに適用される", () => {
      const { container } = render(<PostOwnerMenu onDelete={vi.fn()} className="ml-auto" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("ml-auto");
    });
  });
});
