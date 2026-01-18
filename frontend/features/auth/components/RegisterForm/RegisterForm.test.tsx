import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
  /**
   * 正常系: 基本的なレンダリング
   */
  describe("基本的なレンダリング", () => {
    it("タイトルが正しく表示される", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.getByRole("heading", { name: "登録" })).toBeInTheDocument();
    });

    it("メールアドレス入力フィールドが表示される", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    it("表示名入力フィールドが表示される", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText("表示名")).toBeInTheDocument();
    });

    it("パスワード入力フィールドが表示される", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    });

    it("パスワード確認入力フィールドが表示される", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText("パスワード（確認）")).toBeInTheDocument();
    });

    it("登録ボタンが表示される", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
    });

    it("ログインリンクが表示される", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      const link = screen.getByRole("link", { name: "こちら" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/login");
    });
  });

  /**
   * 正常系: フォーム送信
   */
  describe("フォーム送信", () => {
    it("有効な入力でフォーム送信が成功する", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<RegisterForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.type(screen.getByLabelText("表示名"), "山田太郎");
      await user.type(screen.getByLabelText("パスワード"), "ValidPassword123");
      await user.type(screen.getByLabelText("パスワード（確認）"), "ValidPassword123");

      await user.click(screen.getByRole("button", { name: "登録" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        // 第1引数のみをチェック（第2引数はイベントオブジェクト）
        expect(onSubmit.mock.calls[0][0]).toEqual({
          email: "test@example.com",
          displayName: "山田太郎",
          password: "ValidPassword123",
          confirmPassword: "ValidPassword123",
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

      render(<RegisterForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole("button", { name: "登録" }));

      expect(await screen.findByText("メールアドレスを入力してください")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("メールアドレス形式が不正な場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<RegisterForm onSubmit={onSubmit} />);

      // noValidateを設定してHTMLバリデーションを無効化
      const form = screen.getByRole("button", { name: "登録" }).closest("form");
      form?.setAttribute("noValidate", "true");

      await user.type(screen.getByLabelText("メールアドレス"), "invalid-email");
      await user.click(screen.getByRole("button", { name: "登録" }));

      expect(await screen.findByText("正しいメールアドレスを入力してください")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("表示名が空の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<RegisterForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.click(screen.getByRole("button", { name: "登録" }));

      expect(await screen.findByText("表示名を入力してください")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("パスワードが12文字未満の場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<RegisterForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.type(screen.getByLabelText("表示名"), "山田太郎");
      await user.type(screen.getByLabelText("パスワード"), "short");
      await user.click(screen.getByRole("button", { name: "登録" }));

      expect(
        await screen.findByText("パスワードは12文字以上である必要があります")
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("パスワードに大文字・小文字・数字が含まれていない場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<RegisterForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.type(screen.getByLabelText("表示名"), "山田太郎");
      await user.type(screen.getByLabelText("パスワード"), "invalidpassword");
      await user.click(screen.getByRole("button", { name: "登録" }));

      expect(
        await screen.findByText("パスワードは大文字、小文字、数字を含む必要があります")
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("パスワード確認が一致しない場合エラーが表示される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<RegisterForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
      await user.type(screen.getByLabelText("表示名"), "山田太郎");
      await user.type(screen.getByLabelText("パスワード"), "ValidPassword123");
      await user.type(screen.getByLabelText("パスワード（確認）"), "DifferentPassword123");
      await user.click(screen.getByRole("button", { name: "登録" }));

      expect(await screen.findByText("パスワードが一致しません")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  /**
   * 正常系: パスワード強度インジケーター
   */
  describe("パスワード強度インジケーター", () => {
    it("パスワード入力時に強度インジケーターが表示される", async () => {
      const user = userEvent.setup();

      render(<RegisterForm onSubmit={vi.fn()} />);

      await user.type(screen.getByLabelText("パスワード"), "ValidPassword123");

      // 強度ラベルが表示されることを確認（弱い/普通/強い）
      expect(await screen.findByText(/弱い|普通|強い/)).toBeInTheDocument();
    });

    it("パスワードが空の場合は強度インジケーターが表示されない", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.queryByText(/弱い|普通|強い/)).not.toBeInTheDocument();
    });
  });

  /**
   * 正常系: ローディング状態
   */
  describe("ローディング状態", () => {
    it("ローディング中はボタンが無効化される", () => {
      render(<RegisterForm onSubmit={vi.fn()} isLoading={true} />);

      const button = screen.getByRole("button", { name: "登録中..." });
      expect(button).toBeDisabled();
    });

    it("ローディング中は全ての入力フィールドが無効化される", () => {
      render(<RegisterForm onSubmit={vi.fn()} isLoading={true} />);

      expect(screen.getByLabelText("メールアドレス")).toBeDisabled();
      expect(screen.getByLabelText("表示名")).toBeDisabled();
      expect(screen.getByLabelText("パスワード")).toBeDisabled();
      expect(screen.getByLabelText("パスワード（確認）")).toBeDisabled();
    });

    it("ローディング中はボタンテキストが変更される", () => {
      render(<RegisterForm onSubmit={vi.fn()} isLoading={true} />);

      expect(screen.getByRole("button", { name: "登録中..." })).toBeInTheDocument();
    });
  });

  /**
   * 正常系: エラーメッセージ表示
   */
  describe("エラーメッセージ表示", () => {
    it("サーバーエラーメッセージが表示される", () => {
      render(
        <RegisterForm onSubmit={vi.fn()} errorMessage="このメールアドレスは既に使用されています" />
      );

      expect(screen.getByText("このメールアドレスは既に使用されています")).toBeInTheDocument();
    });

    it("エラーメッセージがない場合は表示されない", () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(
        screen.queryByText("このメールアドレスは既に使用されています")
      ).not.toBeInTheDocument();
    });
  });
});
