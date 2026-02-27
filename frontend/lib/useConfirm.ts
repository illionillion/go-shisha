import { useConfirmStore } from "./confirm-store";

/**
 * 確認ダイアログを呼び出すフック
 *
 * @returns `confirm(message)` - メッセージを表示し、OK なら true、キャンセルなら false を返す Promise
 *
 * @example
 * ```tsx
 * const confirm = useConfirm();
 *
 * const handleClose = async () => {
 *   if (!await confirm("閉じてもよいですか？")) return;
 *   // 処理を続ける
 * };
 * ```
 */
export function useConfirm() {
  return useConfirmStore((state) => state.open);
}
