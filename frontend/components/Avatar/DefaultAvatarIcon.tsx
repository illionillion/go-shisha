import type { FC } from "react";

type Props = {
  size?: number;
  className?: string;
};

/**
 * デフォルトのアバター用SVG（人物型）
 * - VRTでの安定性のためアニメーションを含まない静的なコンポーネントにしています
 */
export const DefaultAvatarIcon: FC<Props> = ({ size = 32, className = "" }) => {
  const w = Math.round(size * 0.6);
  const h = w;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="currentColor" />
      <path d="M4 20a8 8 0 0116 0v1H4v-1z" fill="currentColor" />
    </svg>
  );
};

export default DefaultAvatarIcon;
