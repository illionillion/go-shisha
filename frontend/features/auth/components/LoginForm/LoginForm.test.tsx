import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  /**
   * 正常系: 基本的なレンダリング
   */
  describe("基本的なレンダリング", () => {
    it("タイトルが正しく表示される", () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
    });

    it("メールアドレス入力フィールドが表示される", () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    it("パスワード入力フィールドが表示される", () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    });

    it("ログインボタンが表示される", () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
    });

    it("登録リンクが表示される", () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      const link = screen.getByRole("link", { name: "こちら" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/register");
    });
  });

  /**
   * 正常系: フォーム送信
   */
  describe("フォーム送信", () => {
    it("有効な入力でフォーム送信が成功する", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.type(screen.getByLabelText("パスワード"), "ValidPassword123");

      await user.click(screen.getByRole("button", { name: "ログイン" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        // 第1引数のみをチェック（第2引数はイベントオブジェクト）
        expect(onSubmit.mock.calls[0][0]).toEqual({
          email: "test@example.com",
          password: "ValidPassword123",
        });
      });
    });
  });

  /**
   * 異常系: バリデーションエラー
   */
  describe("バリデーションエラー", () => {
    it("メールアドレスが空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole("button", { name: "ログイン" }));

      expect(await screen.findByText("メールアドレスを入力してください")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("メールアドレス形式が不正な場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      // noValidateを設定してHTMLバリデーションを無効化
      const form = screen.getByRole("button", { name: "ログイン" }).closest("form");
      form?.setAttribute("noValidate", "true");

      await user.type(screen.getByLabelText("メールアドレス"), "invalid-email");
      await user.click(screen.getByRole("button", { name: "ログイン" }));

      expect(await screen.findByText("正しいメールアドレスを入力してください")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("パスワードが空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.click(screen.getByRole("button", { name: "ログイン" }));

      expect(await screen.findByText("パスワードを入力してください")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("パスワードが12文字未満の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.type(screen.getByLabelText("パスワード"), "short");
      await user.click(screen.getByRole("button", { name: "ログイン" }));

      expect(
        await screen.findByText("パスワードは12文字以上である必要があります")
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  /**
   * 正常系: ローディング状態
   */
  describe("ローディング状態", () => {
    it("ローディング中はボタンが無効化される", () => {
      render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

      const button = screen.getByRole("button", { name: "ログイン中..." });
      expect(button).toBeDisabled();
    });

    it("ローディング中は入力フィールドが無効化される", () => {
      render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

      expect(screen.getByLabelText("メールアドレス")).toBeDisabled();
      expect(screen.getByLabelText("パスワード")).toBeDisabled();
    });

    it("ローディング中はボタンテキストが変更される", () => {
      render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

      expect(screen.getByRole("button", { name: "ログイン中..." })).toBeInTheDocument();
    });
  });

  /**
   * 正常系: エラーメッセージ表示
   */
  describe("エラーメッセージ表示", () => {
    it("サーバーエラーメッセージが表示される", () => {
      render(
        <LoginForm
          onSubmit={vi.fn()}
          errorMessage="メールアドレスまたはパスワードが正しくありません"
        />
      );

      expect(
        screen.getByText("メールアドレスまたはパスワードが正しくありません")
      ).toBeInTheDocument();
    });

    it("エラーメッセージがない場合は表示されない", () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(
        screen.queryByText("メールアドレスまたはパスワードが正しくありません")
      ).not.toBeInTheDocument();
    });
  });
});
