import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const cardVariants = cva(
  [
    "rounded-lg",
    "overflow-hidden",
    "bg-white",
    "shadow-md",
    "hover:shadow-xl",
    "transition-shadow",
    "duration-300",
    "cursor-pointer",
  ],
  {
    variants: {
      variant: {
        default: ["w-full", "max-w-sm"],
        compact: ["w-full", "max-w-xs"],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const imageVariants = cva(["w-full", "object-cover"], {
  variants: {
    variant: {
      default: ["h-80"],
      compact: ["h-60"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * シーシャ投稿を表示するカードコンポーネント
 */
export interface ShishaCardProps extends VariantProps<typeof cardVariants> {
  /** 画像URL */
  imageUrl: string;
  /** 投稿の説明テキスト */
  message: string;
  /** いいね数 */
  likes: number;
  /** 投稿ユーザー情報 */
  user: {
    /** ユーザー表示名 */
    displayName: string;
    /** ユーザーアイコンURL */
    iconUrl?: string;
  };
  /** クリックハンドラ */
  onClick?: () => void;
}

/**
 * ShishaCard Component
 *
 * @example
 * ```tsx
 * <ShishaCard
 *   imageUrl="https://via.placeholder.com/300x400"
 *   message="美味しいシーシャでした！"
 *   likes={42}
 *   user={{ displayName: "山田太郎", iconUrl: "https://via.placeholder.com/40" }}
 *   variant="default"
 * />
 * ```
 */
export const ShishaCard = ({
  imageUrl,
  message,
  likes,
  user,
  variant,
  onClick,
}: ShishaCardProps) => {
  return (
    <div
      className={clsx(cardVariants({ variant }))}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${user.displayName}さんの投稿: ${message}` : undefined}
    >
      {/* 画像エリア */}
      <img
        src={imageUrl}
        alt={`${user.displayName}さんの投稿画像`}
        className={clsx(imageVariants({ variant }))}
      />

      {/* 情報エリア */}
      <div className={clsx(["p-4"])}>
        {/* 投稿者情報 */}
        <div className={clsx(["mb-3", "flex", "items-center", "gap-2"])}>
          {user.iconUrl ? (
            <img
              src={user.iconUrl}
              alt={user.displayName}
              className={clsx(["h-8", "w-8", "rounded-full", "object-cover"])}
            />
          ) : (
            <div
              className={clsx([
                "flex",
                "h-8",
                "w-8",
                "items-center",
                "justify-center",
                "rounded-full",
                "bg-gray-300",
                "text-sm",
                "font-semibold",
                "text-gray-600",
              ])}
            >
              {user.displayName.charAt(0)}
            </div>
          )}
          <span className={clsx(["text-sm", "font-semibold", "text-gray-800"])}>
            {user.displayName}
          </span>
        </div>

        {/* 説明テキスト */}
        <p className={clsx(["mb-3", "text-sm", "text-gray-700", "line-clamp-3"])}>{message}</p>

        {/* いいね数 */}
        <div className={clsx(["flex", "items-center", "gap-1", "text-sm", "text-gray-600"])}>
          <svg
            className={clsx(["h-5", "w-5", "fill-current", "text-red-500"])}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className={clsx(["font-medium"])}>{likes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
