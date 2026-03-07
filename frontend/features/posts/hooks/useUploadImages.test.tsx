import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApiError } from "@/lib/api-client";
import * as apiClient from "@/lib/api-client";
import { getUploadImageErrorMessage } from "../utils/uploadErrors";
import { useUploadImages } from "./useUploadImages";

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

    it("アップロード成功時にurlsがundefinedの場合、空配列でonSuccessが呼ばれる", async () => {
      const onSuccess = vi.fn();

      vi.mocked(apiClient.apiFetch).mockResolvedValue({
        data: { urls: undefined },
        status: 200,
        headers: new Headers(),
      });

      const { result } = renderHook(() => useUploadImages({ onSuccess }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith([]);
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

    it("APIエラー時にonErrorが型付きエラーコードの日本語メッセージで呼ばれる（payload_too_large）", async () => {
      const onError = vi.fn();
      const mockError = {
        bodyJson: {
          error: "payload_too_large",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("ファイルサイズが大きすぎます");
      });
    });

    it("APIエラー時にonErrorが型付きエラーコードの日本語メッセージで呼ばれる（validation_failed）", async () => {
      const onError = vi.fn();
      const mockError = {
        bodyJson: {
          error: "validation_failed",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("ファイル形式またはサイズが不正です");
      });
    });

    it("APIエラー時にonErrorが型付きエラーコードの日本語メッセージで呼ばれる（unauthorized）", async () => {
      const onError = vi.fn();
      const mockError = {
        bodyJson: {
          error: "unauthorized",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("ログインが必要です");
      });
    });

    it("APIエラー時にonErrorが型付きエラーコードの日本語メッセージで呼ばれる（internal_server_error）", async () => {
      const onError = vi.fn();
      const mockError = {
        bodyJson: {
          error: "internal_server_error",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("サーバーエラーが発生しました");
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

  describe("getUploadImageErrorMessage", () => {
    it("payload_too_large → 日本語メッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: "payload_too_large" },
      } as ApiError;

      const result = getUploadImageErrorMessage(error);

      expect(result).toBe("ファイルサイズが大きすぎます");
    });

    it("validation_failed → 日本語メッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: "validation_failed" },
      } as ApiError;

      const result = getUploadImageErrorMessage(error);

      expect(result).toBe("ファイル形式またはサイズが不正です");
    });

    it("unauthorized → 日本語メッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: "unauthorized" },
      } as ApiError;

      const result = getUploadImageErrorMessage(error);

      expect(result).toBe("ログインが必要です");
    });

    it("internal_server_error → 日本語メッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: "internal_server_error" },
      } as ApiError;

      const result = getUploadImageErrorMessage(error);

      expect(result).toBe("サーバーエラーが発生しました");
    });

    it("bodyJsonがない場合はデフォルトメッセージを返す", () => {
      const error: ApiError = {} as ApiError;

      const result = getUploadImageErrorMessage(error);

      expect(result).toBe("画像のアップロードに失敗しました");
    });

    it("未知のエラーコードの場合はデフォルトメッセージを返す", () => {
      const error: ApiError = {
        bodyJson: { error: "unknown_error_code" },
      } as unknown as ApiError;

      const result = getUploadImageErrorMessage(error);

      expect(result).toBe("画像のアップロードに失敗しました");
    });
  });
});
