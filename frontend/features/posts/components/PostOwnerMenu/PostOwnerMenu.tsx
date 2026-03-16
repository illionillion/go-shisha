"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { useRef, useState } from "react";
import { DotsHorizontalIcon, DotsVerticalIcon } from "@/components/icons";
import { useOutsideClickAndEsc } from "../../hooks/useOutsideClickAndEsc";

interface PostOwnerMenuProps {
  /** 削除アクションのコールバック */
  onDelete: () => void;
  /** メニューの表示位置（'top': ボタン上, 'bottom': ボタン下（デフォルト）） */
  menuPosition?: "top" | "bottom";
  /** ボタンのバリアント（'card': 画像オーバーレイ用, 'detail': テキスト用（デフォルト）） */
  variant?: "card" | "detail";
  /** クリックイベントの伝播を停止するか（リンクオーバーレイ内で使用する場合はtrue） */
  stopPropagation?: boolean;
  /** ラッパーdivに追加するクラス名 */
  className?: string;
}

const buttonVariants = cva([], {
  variants: {
    variant: {
      card: [
        "p-2",
        "rounded-full",
        "bg-white/20",
        "backdrop-blur-sm",
        "hover:bg-white/30",
        "transition-colors",
      ],
      detail: ["p-1", "rounded", "text-gray-500", "hover:bg-gray-100", "focus:outline-none"],
    },
  },
  defaultVariants: {
    variant: "detail",
  },
});

/**
 * 投稿オーナー向けメニューコンポーネント
 * 3点リーダーボタン＋削除アクションを共通化したUIコンポーネント。
 * 開閉状態・外部クリック/ESCで閉じる処理を内包する。
 */
export function PostOwnerMenu({
  onDelete,
  menuPosition = "bottom",
  variant = "detail",
  stopPropagation = false,
  className,
}: PostOwnerMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /** メニュー外クリックおよびESCキーで閉じる */
  useOutsideClickAndEsc({
    ref: menuRef,
    isOpen: isMenuOpen,
    onClose: () => setIsMenuOpen(false),
  });

  /** メニュー開閉トグル */
  const handleMenuToggle = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMenuOpen((prev) => !prev);
  };

  /** 削除ボタンクリック */
  const handleDeleteClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMenuOpen(false);
    onDelete();
  };

  return (
    <div ref={menuRef} className={clsx(["relative", className])}>
      <button
        type="button"
        onClick={handleMenuToggle}
        aria-label="メニュー"
        aria-expanded={isMenuOpen}
        className={buttonVariants({ variant })}
      >
        {variant === "card" ? <DotsHorizontalIcon /> : <DotsVerticalIcon />}
      </button>

      {isMenuOpen && (
        <div
          className={clsx([
            "absolute",
            "right-0",
            menuPosition === "top" ? "bottom-full" : "mt-1",
            menuPosition === "top" && "mb-1",
            "w-28",
            "bg-white",
            "rounded-lg",
            "shadow-lg",
            "overflow-hidden",
            "z-10",
          ])}
        >
          <button
            type="button"
            onClick={handleDeleteClick}
            className={clsx([
              "w-full",
              "px-4",
              "py-2",
              "text-sm",
              "text-left",
              "text-red-600",
              "hover:bg-red-50",
              "transition-colors",
            ])}
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
