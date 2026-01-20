import { describe, it, expect, beforeEach } from "vitest";
import type { User } from "@/types/domain";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  const mockUser: User = {
    id: 1,
    display_name: "テストユーザー",
    email: "test@example.com",
    icon_url: "https://example.com/icon.png",
    description: "テスト用ユーザー",
  };

  beforeEach(() => {
    // 各テスト前にストアをリセット
    useAuthStore.setState({ user: null });
  });

  describe("初期状態", () => {
    it("user は null である", () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });
  });

  describe("setUser", () => {
    it("ユーザー情報を設定できる", () => {
      const { setUser } = useAuthStore.getState();
      setUser(mockUser);

      const { user } = useAuthStore.getState();
      expect(user).toEqual(mockUser);
    });

    it("null を設定できる", () => {
      const { setUser } = useAuthStore.getState();
      // 先にユーザーを設定
      setUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);

      // null で上書き
      setUser(null);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe("clearUser", () => {
    it("ユーザー情報をクリアできる", () => {
      const { setUser, clearUser } = useAuthStore.getState();

      // 先にユーザーを設定
      setUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);

      // クリア
      clearUser();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("既に null の状態でも問題なく動作する", () => {
      const { clearUser } = useAuthStore.getState();

      expect(useAuthStore.getState().user).toBeNull();
      clearUser();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
