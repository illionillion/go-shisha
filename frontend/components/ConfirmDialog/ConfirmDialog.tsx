"use client";
import { clsx } from "clsx";
import { FocusTrap } from "focus-trap-react";
import { useConfirmStore } from "@/lib/confirm-store";

/**
 * グローバル確認ダイアログ
 *
 * `useConfirm()` フックと組み合わせて使用する。
 * `app/layout.tsx` に一度だけ配置することで、アプリ全体で確認ダイアログを利用できる。
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <ConfirmDialog />
 * ```
 */
export function ConfirmDialog() {
  const { isOpen, message, confirm, cancel } = useConfirmStore();

  if (!isOpen) return null;

  return (
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        escapeDeactivates: false,
      }}
    >
      <div
        className={clsx([
          "fixed",
          "inset-0",
          "z-60",
          "flex",
          "items-center",
          "justify-center",
          "p-4",
        ])}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* バックドロップ */}
        <div
          data-testid="confirm-dialog-backdrop"
          className={clsx(["fixed", "inset-0", "bg-black/50"])}
          onClick={cancel}
          aria-hidden="true"
        />

        {/* ダイアログパネル */}
        <div
          className={clsx([
            "relative",
            "w-full",
            "max-w-sm",
            "bg-white",
            "rounded-xl",
            "shadow-xl",
            "p-6",
            "flex",
            "flex-col",
            "gap-4",
          ])}
        >
          <p
            id="confirm-dialog-title"
            className={clsx(["text-sm", "text-gray-700", "whitespace-pre-wrap"])}
          >
            {message}
          </p>

          <div className={clsx(["flex", "justify-end", "gap-3"])}>
            <button
              type="button"
              onClick={cancel}
              className={clsx([
                "px-4",
                "py-2",
                "text-sm",
                "font-medium",
                "text-gray-700",
                "bg-gray-100",
                "rounded-lg",
                "hover:bg-gray-200",
                "transition-colors",
              ])}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={confirm}
              className={clsx([
                "px-4",
                "py-2",
                "text-sm",
                "font-medium",
                "text-white",
                "bg-blue-600",
                "rounded-lg",
                "hover:bg-blue-700",
                "transition-colors",
              ])}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
