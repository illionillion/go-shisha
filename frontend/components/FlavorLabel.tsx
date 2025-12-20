import clsx from "clsx";
import type { FC } from "react";
import type { GoShishaBackendInternalModelsFlavor } from "@/api/model";

// フレーバー色のマッピング（Tailwind動的クラス対策）
const getFlavorColorClass = (color: string | undefined): string => {
  const colorMap: Record<string, string> = {
    "bg-green-500": "bg-green-500",
    "bg-red-500": "bg-red-500",
    "bg-purple-500": "bg-purple-500",
    "bg-yellow-500": "bg-yellow-500",
    "bg-orange-500": "bg-orange-500",
    "bg-indigo-500": "bg-indigo-500",
  };
  return colorMap[color || ""] || "bg-gray-500";
};

export type FlavorLabelProps = {
  flavor: GoShishaBackendInternalModelsFlavor;
  className?: string | string[];
};

/**
 * フレーバー名＋色ラベルの共通コンポーネント
 */
export const FlavorLabel: FC<FlavorLabelProps> = ({ flavor, className }) => {
  const { name, color } = flavor;
  const colorClass = getFlavorColorClass(color);
  return (
    <span
      className={clsx([
        "inline-block",
        "mt-2",
        "px-2",
        "py-1",
        "text-xs",
        "rounded-full",
        "text-white",
        "select-none",
        colorClass,
        className,
      ])}
    >
      {name}
    </span>
  );
};
