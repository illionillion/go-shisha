import { usePostUploadsImages } from "@/api/uploads";
import type { ApiError } from "@/lib/api-client";
import { isSuccessResponse } from "@/lib/api-helpers";

// 定数
const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 画像ファイルのバリデーション
 */
export const validateImages = (files: File[]): string | null => {
  if (files.length === 0) {
    return "画像を選択してください";
  }
  if (files.length > MAX_FILES) {
    return "画像は最大10枚までアップロードできます";
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return `ファイルサイズが10MBを超えています: ${file.name}`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "JPEG, PNG, WebP, GIF形式のみ対応しています";
    }
  }
  return null;
};

/**
 * APIエラーメッセージを日本語に変換
 */
const translateErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "error" in error) {
    const errorMsg = String((error as { error: unknown }).error);
    if (errorMsg.includes("file size exceeds limit")) {
      return "ファイルサイズが10MBを超えています";
    }
    if (errorMsg.includes("too many files")) {
      return "画像は最大10枚までアップロードできます";
    }
    if (errorMsg.includes("invalid file type")) {
      return "JPEG, PNG, WebP, GIF形式のみ対応しています";
    }
  }
  return "画像のアップロードに失敗しました";
};

/**
 * 画像アップロード用カスタムフック
 *
 * 画像ファイルをバックエンドにアップロードし、URLを取得します。
 * - クライアント側バリデーション（枚数・サイズ・形式チェック）
 * - エラーハンドリング（日本語メッセージ）
 * - Progress状態管理
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useUploadImages({
 *   onSuccess: (urls) => {
 *     console.log("アップロード成功:", urls);
 *   },
 *   onError: (error) => {
 *     console.error("エラー:", error);
 *   },
 * });
 *
 * const handleUpload = (files: File[]) => {
 *   const error = validateImages(files);
 *   if (error) {
 *     alert(error);
 *     return;
 *   }
 *   mutate(files);
 * };
 * ```
 */
export function useUploadImages(options?: {
  onSuccess?: (urls: string[]) => void;
  onError?: (error: string) => void;
}) {
  const mutation = usePostUploadsImages<ApiError>({
    mutation: {
      onSuccess: (response) => {
        if (isSuccessResponse(response) && response.data.urls) {
          options?.onSuccess?.(response.data.urls);
        }
      },
      onError: (error) => {
        const message = translateErrorMessage(error);
        options?.onError?.(message);
      },
    },
  });

  const uploadImages = (files: File[]) => {
    // クライアント側バリデーション
    const validationError = validateImages(files);
    if (validationError) {
      options?.onError?.(validationError);
      return;
    }

    // FormDataを作成してアップロード
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    mutation.mutate({
      data: { images: formData.get("images") as File },
    });
  };

  return {
    uploadImages,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * レスポンスからURLリストを取得するヘルパー関数
 */
export function getUploadedUrls(
  response: ReturnType<typeof usePostUploadsImages>["data"]
): string[] | undefined {
  if (!response) return undefined;
  if (isSuccessResponse(response) && response.data.urls) {
    return response.data.urls;
  }
  return undefined;
}
