import { create } from "zustand";
import type { User } from "@/types/domain";

/**
 * 認証ストアの状態定義
 * - `isLoading`: 初回の /auth/me 取得などのハイドレーション中フラグ
 */
export type AuthState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setIsLoading: (loading: boolean) => void;
  /**
   * ストアを初期状態にリセットする
   * - テストや Storybook での状態初期化用途を想定
   */
  reset: () => void;
};

/**
 * 認証ストアの初期状態
 * - テスト等でのリセットに利用することを想定
 */
export const initialAuthState: Pick<AuthState, "user" | "isLoading"> = {
  // 初期はハイドレーション中とする（AuthHydrator が終了次第 false にする）
  user: null,
  isLoading: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialAuthState,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  reset: () => set(initialAuthState),
}));
