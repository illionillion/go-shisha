import clsx from "clsx";
import type { FC } from "react";
import { FlavorLabel } from "@/components/FlavorLabel";
import type { Flavor } from "@/types/domain";

export type FlavorSelectorProps = {
  /**
   * フレーバー一覧（GET /api/v1/flavors から取得したデータ）
   */
  flavors: Flavor[];
  /**
   * 選択されたフレーバーのID（未選択時はundefined）
   */
  selectedFlavorId?: number;
  /**
   * フレーバー選択時のコールバック
   * @param flavorId - 選択されたフレーバーのID（選択解除時はundefined）
   */
  onSelect: (flavorId: number | undefined) => void;
  /**
   * エラー状態（バリデーションエラー等）
   */
  error?: string;
  /**
   * 無効化状態（ローディング中等）
   */
  disabled?: boolean;
  /**
   * カスタムクラス名
   */
  className?: string | string[];
};

/**
 * フレーバー選択コンポーネント
 *
 * 投稿作成時にフレーバーを選択するドロップダウンUI。
 * フレーバーはオプションのため、選択解除も可能。
 *
 * @example
 * ```tsx
 * const [selectedFlavorId, setSelectedFlavorId] = useState<number | undefined>();
 * const query = useGetFlavors();
 * const flavors = getFlavorsData(query);
 *
 * if (!flavors) return null;
 *
 * return (
 *   <FlavorSelector
 *     flavors={flavors}
 *     selectedFlavorId={selectedFlavorId}
 *     onSelect={setSelectedFlavorId}
 *   />
 * );
 * ```
 */
export const FlavorSelector: FC<FlavorSelectorProps> = ({
  flavors,
  selectedFlavorId,
  onSelect,
  error,
  disabled = false,
  className,
}) => {
  // 選択されたフレーバーオブジェクトを取得
  const selectedFlavor = flavors.find((flavor) => flavor.id === selectedFlavorId);

  // セレクトボックスの変更ハンドラー
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    // 空文字列の場合は選択解除
    if (value === "") {
      onSelect(undefined);
    } else {
      onSelect(Number(value));
    }
  };

  return (
    <div className={clsx(["w-full", className])}>
      <label htmlFor="flavor-select" className="block text-sm font-medium text-gray-700 mb-1">
        フレーバー（任意）
      </label>
      <div className="flex items-center gap-2">
        <select
          id="flavor-select"
          value={selectedFlavorId ?? ""}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "flavor-error" : undefined}
          className={clsx([
            "block",
            "w-full",
            "px-3",
            "py-2",
            "border",
            "rounded-md",
            "shadow-sm",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-indigo-500",
            "focus:border-indigo-500",
            "disabled:bg-gray-100",
            "disabled:cursor-not-allowed",
            error ? "border-red-500" : "border-gray-300",
          ])}
        >
          <option value="">フレーバーを選択してください</option>
          {flavors.map((flavor) => (
            <option key={flavor.id} value={flavor.id}>
              {flavor.name}
            </option>
          ))}
        </select>
        {selectedFlavorId && (
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            disabled={disabled}
            aria-label="フレーバー選択を解除"
            className={clsx([
              "px-3",
              "py-2",
              "text-sm",
              "font-medium",
              "text-gray-700",
              "bg-white",
              "border",
              "border-gray-300",
              "rounded-md",
              "hover:bg-gray-50",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-indigo-500",
              "focus:ring-offset-2",
              "disabled:opacity-50",
              "disabled:cursor-not-allowed",
            ])}
          >
            解除
          </button>
        )}
      </div>
      {selectedFlavor && (
        <div className="mt-2">
          <FlavorLabel flavor={selectedFlavor} />
        </div>
      )}
      {error && (
        <p id="flavor-error" className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
