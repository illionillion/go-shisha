import type { FC } from "react";
import DefaultAvatarIcon from "@/components/Avatar/DefaultAvatarIcon";

type Props = {
  size?: number;
  className?: string;
  alt?: string;
};

/**
 * アバターのプレースホルダ（外側の丸枠 + 中のアイコン）
 */
export const DefaultAvatar: FC<Props> = ({ size = 32, className = "", alt = "ユーザー" }) => {
  const px = `${size}px`;
  return (
    <div
      className={`rounded-full bg-gray-200 text-gray-500 flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={alt}
    >
      <DefaultAvatarIcon size={size} />
    </div>
  );
};

export default DefaultAvatar;
