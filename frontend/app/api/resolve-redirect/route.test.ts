import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

// モック設定
vi.mock("@/lib/redirectCrypto", () => ({
  decryptRedirect: vi.fn(),
}));

vi.mock("@/lib/validateRedirect", () => ({
  isSafeRedirectPath: vi.fn(),
}));

describe("/api/resolve-redirect POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("正常系", () => {
    it("有効なトークンで正しいパスが返される", async () => {
      const { decryptRedirect } = await import("@/lib/redirectCrypto");
      const { isSafeRedirectPath } = await import("@/lib/validateRedirect");

      vi.mocked(decryptRedirect).mockResolvedValue("/posts/123");
      vi.mocked(isSafeRedirectPath).mockReturnValue(true);

      const req = new Request("http://localhost:3000/api/resolve-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "valid-token-abc123" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ path: "/posts/123" });
      expect(decryptRedirect).toHaveBeenCalledWith("valid-token-abc123");
      expect(isSafeRedirectPath).toHaveBeenCalledWith("/posts/123");
    });
  });

  describe("異常系: リクエストパラメータ", () => {
    it("トークンが未指定の場合に400エラーが返される", async () => {
      const req = new Request("http://localhost:3000/api/resolve-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "missing token" });
    });

    it("トークンがnullの場合に400エラーが返される", async () => {
      const req = new Request("http://localhost:3000/api/resolve-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: null }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "missing token" });
    });
  });

  describe("異常系: トークン復号化", () => {
    it("不正なトークンの場合に400エラーが返される", async () => {
      const { decryptRedirect } = await import("@/lib/redirectCrypto");

      vi.mocked(decryptRedirect).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/resolve-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "invalid-token" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "invalid token" });
      expect(decryptRedirect).toHaveBeenCalledWith("invalid-token");
    });

    it("復号化されたパスが安全でない場合に400エラーが返される", async () => {
      const { decryptRedirect } = await import("@/lib/redirectCrypto");
      const { isSafeRedirectPath } = await import("@/lib/validateRedirect");

      vi.mocked(decryptRedirect).mockResolvedValue("//evil.com");
      vi.mocked(isSafeRedirectPath).mockReturnValue(false);

      const req = new Request("http://localhost:3000/api/resolve-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "malicious-token" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "invalid token" });
      expect(isSafeRedirectPath).toHaveBeenCalledWith("//evil.com");
    });
  });

  describe("異常系: サーバーエラー", () => {
    it("JSONパースエラーの場合に500エラーが返される", async () => {
      const req = new Request("http://localhost:3000/api/resolve-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json{",
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "internal" });
    });

    it("復号化処理で例外が発生した場合に500エラーが返される", async () => {
      const { decryptRedirect } = await import("@/lib/redirectCrypto");

      vi.mocked(decryptRedirect).mockRejectedValue(new Error("Decryption failed"));

      const req = new Request("http://localhost:3000/api/resolve-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "error-token" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "internal" });
    });
  });
});
