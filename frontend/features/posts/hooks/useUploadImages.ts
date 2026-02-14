import { usePostUploadsImages } from "@/api/uploads";
import type { ApiError } from "@/lib/api-client";
import { isSuccessResponse } from "@/lib/api-helpers";

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
 * バリデーションはサーバー側で行われ、エラーは日本語メッセージに変換されます。
 *
 * @example
 * ```tsx
 * const { uploadImages, isPending } = useUploadImages({
 *   onSuccess: (urls) => {
 *     console.log("アップロード成功:", urls);
 *     setUploadedUrls(urls); // 状態管理に保存
 *   },
 *   onError: (error) => {
 *     alert(error); // エラー表示
 *   },
 * });
 *
 * const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const files = Array.from(e.target.files || []);
 *   uploadImages(files); // 即座にアップロード
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
    // FormDataを作成してアップロード
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    mutation.mutate({
      data: { images: files[0] }, // TODO: 複数ファイル対応が必要な場合は修正
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
