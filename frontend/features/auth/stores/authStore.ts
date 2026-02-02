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
};

export const useAuthStore = create<AuthState>((set) => ({
  // 初期はハイドレーション中とする（AuthHydrator が終了次第 false にする）
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));
