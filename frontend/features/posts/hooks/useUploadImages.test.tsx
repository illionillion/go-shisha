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

    it("APIエラー時にonErrorがサーバーの日本語エラーメッセージで呼ばれる", async () => {
      const onError = vi.fn();
      const mockError = {
        bodyJson: {
          error: "サポートされていないファイル形式です",
        },
      };

      vi.mocked(apiClient.apiFetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("サポートされていないファイル形式です");
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
    it("バックエンドの日本語エラーメッセージをそのまま返す（ファイルサイズ）", () => {
      const error: ApiError = {
        bodyJson: { error: "ファイルサイズが10MBを超えています" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("ファイルサイズが10MBを超えています");
    });

    it("バックエンドの日本語エラーメッセージをそのまま返す（ファイル数）", () => {
      const error: ApiError = {
        bodyJson: { error: "一度に10枚までアップロード可能です" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("一度に10枚までアップロード可能です");
    });

    it("バックエンドの日本語エラーメッセージをそのまま返す（ファイル形式）", () => {
      const error: ApiError = {
        bodyJson: { error: "サポートされていないファイル形式です" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("サポートされていないファイル形式です");
    });

    it("バックエンドのその他のエラーメッセージもそのまま返す", () => {
      const error: ApiError = {
        bodyJson: { error: "予期しないエラーが発生しました" },
      } as ApiError;

      const result = translateErrorMessage(error);

      expect(result).toBe("予期しないエラーが発生しました");
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
