import { describe, it, expect, beforeEach } from "vitest";
import type { User } from "@/types/domain";
import { useAuthStore, initialAuthState } from "./authStore";

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
    useAuthStore.getState().reset();
  });

  describe("初期状態", () => {
    it("user は null である", () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it("isLoading は true である", () => {
      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(true);
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

  describe("setIsLoading", () => {
    it("isLoading を true に設定できる", () => {
      const { setIsLoading } = useAuthStore.getState();

      setIsLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it("isLoading を false に設定できる", () => {
      const { setIsLoading } = useAuthStore.getState();

      // 初期値は true なので false に変更
      setIsLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("isLoading を複数回切り替えられる", () => {
      const { setIsLoading } = useAuthStore.getState();

      setIsLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);

      setIsLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      setIsLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe("reset", () => {
    it("ストアを初期状態にリセットできる", () => {
      const { setUser, setIsLoading, reset } = useAuthStore.getState();

      // ストアを変更
      setUser(mockUser);
      setIsLoading(false);

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isLoading).toBe(false);

      // リセット
      reset();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it("初期状態の値と一致する", () => {
      const { setUser, setIsLoading, reset } = useAuthStore.getState();

      // ストアを変更
      setUser(mockUser);
      setIsLoading(false);

      // リセット
      reset();

      const state = useAuthStore.getState();
      expect(state.user).toBe(initialAuthState.user);
      expect(state.isLoading).toBe(initialAuthState.isLoading);
    });
  });
});
