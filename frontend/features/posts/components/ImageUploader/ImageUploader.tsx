"use client";
import { useCallback, useEffect, useState } from "react";
import { PlusIcon, XIcon } from "@/components/icons";

export type ImageUploaderProps = {
  onFilesSelected: (files: File[]) => void;
  value?: File[];
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
  value,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Controlled/Uncontrolled両対応
  const files = value ?? internalFiles;

  const validateFiles = useCallback(
    (
      newFiles: FileList | File[],
      existingFiles: File[] = []
    ): { valid: File[]; error: string | null } => {
      const fileArray = Array.from(newFiles);

      // ファイル数チェック（既存ファイル含む）
      if (fileArray.length + existingFiles.length > maxFiles) {
        return {
          valid: [],
          error: `最大${maxFiles}枚まで選択できます（現在${existingFiles.length}枚選択中）`,
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

      const { files: droppedFiles } = e.dataTransfer;
      if (droppedFiles && droppedFiles.length > 0) {
        const { valid, error: validationError } = validateFiles(droppedFiles, files);
        setError(validationError);
        if (valid.length > 0) {
          const newFiles = [...files, ...valid];
          if (!value) {
            setInternalFiles(newFiles);
          }
          onFilesSelected(newFiles);
        }
      }
    },
    [disabled, validateFiles, onFilesSelected, files, value]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files: selectedFiles } = e.target;
      if (selectedFiles && selectedFiles.length > 0) {
        const { valid, error: validationError } = validateFiles(selectedFiles, files);
        setError(validationError);
        if (valid.length > 0) {
          const newFiles = [...files, ...valid];
          if (!value) {
            setInternalFiles(newFiles);
          }
          onFilesSelected(newFiles);
        }
      }
      // input要素をリセット（同じファイルを再選択可能にする）
      e.target.value = "";
    },
    [validateFiles, onFilesSelected, files, value]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      if (!value) {
        setInternalFiles(newFiles);
      }
      onFilesSelected(newFiles);
      setError(null);
    },
    [files, value, onFilesSelected]
  );

  // プレビューURL生成とクリーンアップ
  useEffect(() => {
    // 新しいプレビューURLを生成
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    // クリーンアップ関数（前回生成したURLを破棄）
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  return (
    <div className="w-full">
      {/* プレビュー表示 */}
      {files.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              選択中の画像 ({files.length}/{maxFiles}枚)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="group relative aspect-square">
                <img
                  src={previewUrls[index]}
                  alt={`プレビュー ${index + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`画像${index + 1}を削除`}
                >
                  <XIcon className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black bg-opacity-50 px-2 py-1">
                  <p className="truncate text-xs text-white">{file.name}</p>
                  <p className="text-xs text-gray-300">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ファイル選択エリア（上限未満の場合のみ表示） */}
      {files.length < maxFiles && (
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
            {files.length === 0 ? "クリックまたはドラッグ&ドロップで画像を選択" : "画像を追加"}
          </p>
          <p className="text-xs text-gray-500">
            JPG、PNG、WebP、GIF ({maxSizeMB}MB以下、あと{maxFiles - files.length}枚)
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
