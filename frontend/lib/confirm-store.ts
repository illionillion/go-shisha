import { create } from "zustand";

/**
 * 確認ダイアログストアの状態定義
 */
export type ConfirmState = {
  isOpen: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
  /**
   * 確認ダイアログを開き、ユーザーの応答を Promise で返す
   * @param message - ダイアログに表示するメッセージ
   * @returns OK なら true、キャンセルなら false
   */
  open: (message: string) => Promise<boolean>;
  /** OK ボタン押下時: resolve(true) してダイアログを閉じる */
  confirm: () => void;
  /** キャンセルボタン押下時: resolve(false) してダイアログを閉じる */
  cancel: () => void;
  /**
   * ストアを初期状態にリセットする
   * - テストや Storybook での状態初期化用途を想定
   */
  reset: () => void;
};

/**
 * 確認ダイアログストアの初期状態
 * - テスト等でのリセットに利用することを想定
 */
export const initialConfirmState: Pick<ConfirmState, "isOpen" | "message" | "resolve"> = {
  isOpen: false,
  message: "",
  resolve: null,
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  ...initialConfirmState,
  open: (message: string) => {
    return new Promise<boolean>((resolve) => {
      set({ isOpen: true, message, resolve });
    });
  },
  confirm: () => {
    const { resolve } = get();
    resolve?.(true);
    set({ isOpen: false, message: "", resolve: null });
  },
  cancel: () => {
    const { resolve } = get();
    resolve?.(false);
    set({ isOpen: false, message: "", resolve: null });
  },
  reset: () => set(initialConfirmState),
}));
