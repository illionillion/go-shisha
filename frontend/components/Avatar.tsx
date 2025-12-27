"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/getImageUrl";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, alt = "ユーザー", size = 32, className = "" }: AvatarProps) {
  const px = `${size}px`;

  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: px, height: px }}
        role="img"
        aria-label={alt}
      >
        <Image src={getImageUrl(src)} alt={alt} fill sizes={`${size}px`} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-gray-200 text-gray-500 flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={alt}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="currentColor" />
        <path d="M4 20a8 8 0 0116 0v1H4v-1z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default Avatar;
