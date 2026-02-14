import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ApiError } from "@/lib/api-client";
import { isSuccessResponse } from "@/lib/api-helpers";
import type { UploadImagesResponse } from "@/types/domain";

/**
 * APIエラーメッセージを日本語に変換
 *
 * @param error - API エラーオブジェクト
 * @returns 日本語エラーメッセージ
 */
export const translateErrorMessage = (error: ApiError): string => {
  // ApiError.bodyJsonからエラーメッセージを取得
  if (
    error.bodyJson &&
    typeof error.bodyJson === "object" &&
    "error" in error.bodyJson &&
    typeof error.bodyJson.error === "string"
  ) {
    const errorMsg = error.bodyJson.error;
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
 *     toast.error(error); // エラー表示
 *   },
 * });
 *
 * // ファイル選択時に即座にアップロード（X/Twitterパターン）
 * const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const files = Array.from(e.target.files || []);
 *   if (files.length > 0) {
 *     uploadImages(files);
 *   }
 * };
 * ```
 */
export function useUploadImages(options?: {
  onSuccess?: (urls: string[]) => void;
  onError?: (error: string) => void;
}) {
  const mutation = useMutation<
    { data: UploadImagesResponse; status: 200; headers: Headers },
    ApiError,
    File[]
  >({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      // 複数ファイルを同じ名前（images）で追加
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiFetch<{
        data: UploadImagesResponse;
        status: 200;
        headers: Headers;
      }>("/uploads/images", {
        method: "POST",
        body: formData,
      });

      return response as { data: UploadImagesResponse; status: 200; headers: Headers };
    },
    onSuccess: (response) => {
      if (isSuccessResponse(response) && response.data.urls) {
        options?.onSuccess?.(response.data.urls);
      }
    },
    onError: (error) => {
      const message = translateErrorMessage(error);
      options?.onError?.(message);
    },
  });

  const uploadImages = (files: File[]) => {
    if (files.length === 0) {
      options?.onError?.("画像を選択してください");
      return;
    }

    mutation.mutate(files);
  };

  return {
    uploadImages,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
