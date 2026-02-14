import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApiError } from "@/lib/api-client";
import * as apiClient from "@/lib/api-client";
import { useUploadImages, translateErrorMessage } from "./useUploadImages";

vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("useUploadImages", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => React.ReactElement;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    vi.clearAllMocks();
  });

  describe("画像アップロード", () => {
    it("複数ファイルがFormDataとして正しく送信される", async () => {
      const mockUrls = ["https://example.com/image1.jpg", "https://example.com/image2.jpg"];
      vi.mocked(apiClient.apiFetch).mockResolvedValue({
        data: { urls: mockUrls },
        status: 200,
        headers: new Headers(),
      });

      const { result } = renderHook(() => useUploadImages(), { wrapper });

      const files = [
        new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
      ];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(apiClient.apiFetch).toHaveBeenCalledOnce();
      });

      const callArgs = vi.mocked(apiClient.apiFetch).mock.calls[0];
      expect(callArgs[0]).toBe("/uploads/images");
      expect(callArgs[1]?.method).toBe("POST");

      // FormDataが正しく構築されているか確認
      const body = callArgs[1]?.body as FormData;
      expect(body).toBeInstanceOf(FormData);
      const formFiles = body.getAll("images");
      expect(formFiles).toHaveLength(2);
      expect(formFiles[0]).toBe(files[0]);
      expect(formFiles[1]).toBe(files[1]);
    });

    it("アップロード成功時にonSuccessが正しいURLsで呼ばれる", async () => {
      const onSuccess = vi.fn();
      const mockUrls = ["https://example.com/image1.jpg", "https://example.com/image2.jpg"];

      vi.mocked(apiClient.apiFetch).mockResolvedValue({
        data: { urls: mockUrls },
        status: 200,
        headers: new Headers(),
      });

      const { result } = renderHook(() => useUploadImages({ onSuccess }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockUrls);
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("アップロード中はisPendingがtrueになる", async () => {
      vi.mocked(apiClient.apiFetch).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useUploadImages(), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });
    });

    it("APIエラー時にonErrorが日本語エラーメッセージで呼ばれる", async () => {
      const onError = vi.fn();
      const mockError = {
        bodyJson: {
          error: "invalid file type",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("JPEG, PNG, WebP, GIF形式のみ対応しています");
      });
    });
  });

  describe("空配列チェック", () => {
    it("空配列が渡された場合、onErrorが呼ばれる", () => {
      const onError = vi.fn();

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      result.current.uploadImages([]);

      expect(onError).toHaveBeenCalledWith("画像を選択してください");
      expect(apiClient.apiFetch).not.toHaveBeenCalled();
    });
  });

  describe("translateErrorMessage", () => {
    it("ファイルサイズエラーを日本語に変換する", () => {
      const error: ApiError = {
        bodyJson: { error: "file size exceeds limit" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("ファイルサイズが10MBを超えています");
    });

    it("ファイル数エラーを日本語に変換する", () => {
      const error: ApiError = {
        bodyJson: { error: "too many files" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("画像は最大10枚までアップロードできます");
    });

    it("ファイル形式エラーを日本語に変換する", () => {
      const error: ApiError = {
        bodyJson: { error: "invalid file type" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("JPEG, PNG, WebP, GIF形式のみ対応しています");
    });

    it("未知のエラーをデフォルトメッセージに変換する", () => {
      const error: ApiError = {
        bodyJson: { error: "unknown server error" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("画像のアップロードに失敗しました");
    });

    it("bodyJsonがない場合はデフォルトメッセージを返す", () => {
      const error: ApiError = {} as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("画像のアップロードに失敗しました");
    });

    it("bodyJson.errorが文字列でない場合はデフォルトメッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: 123 },
      } as unknown as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("画像のアップロードに失敗しました");
    });
  });
});
