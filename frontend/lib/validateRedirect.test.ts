import { describe, it, expect } from "vitest";
import { isSafeRedirectPath } from "./validateRedirect";

describe("validateRedirect", () => {
  describe("isSafeRedirectPath", () => {
    describe("安全なパス（trueを返すべき）", () => {
      it("通常の相対パスを許可する", () => {
        expect(isSafeRedirectPath("/posts/123")).toBe(true);
        expect(isSafeRedirectPath("/profile")).toBe(true);
        expect(isSafeRedirectPath("/posts/abc-def")).toBe(true);
      });

      it("クエリパラメータ付きのパスを許可する", () => {
        expect(isSafeRedirectPath("/posts/123?query=test")).toBe(true);
        expect(isSafeRedirectPath("/search?q=keyword")).toBe(true);
      });

      it("ハッシュ付きのパスを許可する", () => {
        expect(isSafeRedirectPath("/posts/123#section")).toBe(true);
        expect(isSafeRedirectPath("/page#top")).toBe(true);
      });

      it("複雑なクエリとハッシュの組み合わせを許可する", () => {
        expect(isSafeRedirectPath("/posts/123?query=test&foo=bar#section")).toBe(true);
      });
    });

    describe("危険なパス（falseを返すべき）", () => {
      it("プロトコル相対URL（//始まり）を拒否する", () => {
        expect(isSafeRedirectPath("//evil.com")).toBe(false);
        expect(isSafeRedirectPath("//evil.com/path")).toBe(false);
        expect(isSafeRedirectPath("//example.org")).toBe(false);
      });

      it("バックスラッシュを含むパスを拒否する", () => {
        expect(isSafeRedirectPath("/\\evil.com")).toBe(false);
        expect(isSafeRedirectPath("/path\\to\\page")).toBe(false);
        expect(isSafeRedirectPath("\\path")).toBe(false);
      });

      it("絶対URLを拒否する（相対パスでない）", () => {
        expect(isSafeRedirectPath("http://evil.com")).toBe(false);
        expect(isSafeRedirectPath("https://evil.com")).toBe(false);
        expect(isSafeRedirectPath("ftp://evil.com")).toBe(false);
      });

      it("相対パスでないパスを拒否する", () => {
        expect(isSafeRedirectPath("posts/123")).toBe(false);
        expect(isSafeRedirectPath("profile")).toBe(false);
      });
    });

    describe("除外対象パス（falseを返すべき）", () => {
      it("ルートパス（/）を拒否する", () => {
        expect(isSafeRedirectPath("/")).toBe(false);
      });

      it("ログインページを拒否する", () => {
        expect(isSafeRedirectPath("/login")).toBe(false);
      });

      it("登録ページを拒否する", () => {
        expect(isSafeRedirectPath("/register")).toBe(false);
      });

      it("_next内部パスを拒否する", () => {
        expect(isSafeRedirectPath("/_next/static/chunks/main.js")).toBe(false);
        expect(isSafeRedirectPath("/_next/image")).toBe(false);
        expect(isSafeRedirectPath("/_next")).toBe(false);
      });

      it("APIパスを拒否する", () => {
        expect(isSafeRedirectPath("/api/posts")).toBe(false);
        expect(isSafeRedirectPath("/api/users/123")).toBe(false);
        expect(isSafeRedirectPath("/api")).toBe(false);
      });
    });

    describe("長さ制限", () => {
      it("2048文字以下のパスを許可する", () => {
        const validPath = "/posts/" + "a".repeat(2040);
        expect(isSafeRedirectPath(validPath)).toBe(true);
      });

      it("2048文字ちょうどのパスを許可する", () => {
        const validPath = "/" + "a".repeat(2047);
        expect(isSafeRedirectPath(validPath)).toBe(true);
      });

      it("2048文字を超えるパスを拒否する", () => {
        const tooLongPath = "/posts/" + "a".repeat(2050);
        expect(isSafeRedirectPath(tooLongPath)).toBe(false);
      });
    });

    describe("境界値テスト", () => {
      it("nullを拒否する", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSafeRedirectPath(null as any)).toBe(false);
      });

      it("undefinedを拒否する", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSafeRedirectPath(undefined as any)).toBe(false);
      });

      it("空文字列を拒否する", () => {
        expect(isSafeRedirectPath("")).toBe(false);
      });

      it("数値を拒否する", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSafeRedirectPath(123 as any)).toBe(false);
      });

      it("オブジェクトを拒否する", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSafeRedirectPath({} as any)).toBe(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSafeRedirectPath({ path: "/posts" } as any)).toBe(false);
      });

      it("配列を拒否する", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSafeRedirectPath([] as any)).toBe(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSafeRedirectPath(["/posts"] as any)).toBe(false);
      });
    });

    describe("特殊ケース", () => {
      it("パスのみ（スラッシュ1つ）のパスを許可する", () => {
        expect(isSafeRedirectPath("/a")).toBe(true);
      });

      it("日本語を含むパスを許可する", () => {
        expect(isSafeRedirectPath("/posts/テスト")).toBe(true);
      });

      it("URLエンコードされたパスを許可する", () => {
        expect(isSafeRedirectPath("/posts/%E3%83%86%E3%82%B9%E3%83%88")).toBe(true);
      });

      it("特殊文字を含むパスを許可する", () => {
        expect(isSafeRedirectPath("/posts/test-post_123")).toBe(true);
        expect(isSafeRedirectPath("/posts/test.html")).toBe(true);
      });
    });
  });
});
