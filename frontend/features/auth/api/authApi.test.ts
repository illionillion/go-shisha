import { describe, it, expect, vi, beforeEach } from "vitest";
import { postAuthLogin, postAuthLogout, postAuthRegister } from "@/api/auth";
import { authApi } from "./authApi";

vi.mock("@/api/auth", () => ({
  postAuthLogin: vi.fn(),
  postAuthRegister: vi.fn(),
  postAuthLogout: vi.fn(),
}));

const mockUser = {
  id: 1,
  display_name: "テストユーザー",
  email: "test@example.com",
  icon_url: "https://example.com/icon.png",
  description: "テスト用ユーザー",
};

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("ログインAPIを呼び出し、AuthResponseを返す", async () => {
      vi.mocked(postAuthLogin).mockResolvedValue({
        data: { user: mockUser },
        status: 200,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof postAuthLogin>>);

      const result = await authApi.login({
        email: "test@example.com",
        password: "ValidPassword123",
      });

      expect(postAuthLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "ValidPassword123",
      });
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe("register", () => {
    it("登録APIを呼び出し、AuthResponseを返す", async () => {
      vi.mocked(postAuthRegister).mockResolvedValue({
        data: { user: mockUser },
        status: 201,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof postAuthRegister>>);

      const result = await authApi.register({
        email: "test@example.com",
        password: "ValidPassword123",
        display_name: "テストユーザー",
      });

      expect(postAuthRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "ValidPassword123",
        display_name: "テストユーザー",
      });
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe("logout", () => {
    it("ログアウトAPIを呼び出し、LogoutResponseを返す", async () => {
      const mockResponse = { message: "ログアウトしました" };
      vi.mocked(postAuthLogout).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof postAuthLogout>>);

      const result = await authApi.logout();

      expect(postAuthLogout).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });
});
