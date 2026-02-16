import { useCallback, useState } from "react";
import { PlusIcon } from "@/components/icons";

export type ImageUploaderProps = {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
};

/**
 * 画像アップロードコンポーネント
 *
 * ドラッグ&ドロップまたはクリックで画像を選択
 * 複数ファイル選択対応、バリデーション機能付き
 *
 * @example
 * ```tsx
 * <ImageUploader
 *   onFilesSelected={(files) => console.log(files)}
 *   maxFiles={5}
 *   maxSizeMB={10}
 * />
 * ```
 */
export function ImageUploader({
  onFilesSelected,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: FileList | File[]): { valid: File[]; error: string | null } => {
      const fileArray = Array.from(files);

      // ファイル数チェック
      if (fileArray.length > maxFiles) {
        return {
          valid: [],
          error: `最大${maxFiles}枚まで選択できます`,
        };
      }

      // ファイル形式とサイズのチェック
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (!acceptedFormats.includes(file.type)) {
          return {
            valid: [],
            error: "JPG、PNG、WebP、GIF形式の画像を選択してください",
          };
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          return {
            valid: [],
            error: `ファイルサイズは${maxSizeMB}MB以下にしてください`,
          };
        }

        validFiles.push(file);
      }

      return { valid: validFiles, error: null };
    },
    [maxFiles, maxSizeMB, acceptedFormats]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        const { valid, error: validationError } = validateFiles(files);
        setError(validationError);
        if (valid.length > 0) {
          onFilesSelected(valid);
        }
      }
    },
    [disabled, validateFiles, onFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files && files.length > 0) {
        const { valid, error: validationError } = validateFiles(files);
        setError(validationError);
        if (valid.length > 0) {
          onFilesSelected(valid);
        }
      }
      // input要素をリセット（同じファイルを再選択可能にする）
      e.target.value = "";
    },
    [validateFiles, onFilesSelected]
  );

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-8 transition-all
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
          ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-blue-400 hover:bg-blue-50"}
        `}
      >
        <input
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="画像ファイルを選択"
        />

        <PlusIcon className="mb-4 h-12 w-12 text-gray-400" />

        <p className="mb-2 text-sm font-medium text-gray-700">
          クリックまたはドラッグ&ドロップで画像を選択
        </p>
        <p className="text-xs text-gray-500">
          JPG、PNG、WebP、GIF ({maxSizeMB}MB以下、最大{maxFiles}枚)
        </p>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
