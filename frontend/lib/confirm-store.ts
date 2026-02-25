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
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  message: "",
  resolve: null,
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
}));
