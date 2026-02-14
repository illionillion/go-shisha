import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as uploadsApi from "@/api/uploads";
import { useUploadImages, validateImages } from "./useUploadImages";

vi.mock("@/api/uploads", () => ({
  usePostUploadsImages: vi.fn(),
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

  describe("validateImages", () => {
    it("空配列の場合はエラーを返す", () => {
      expect(validateImages([])).toBe("画像を選択してください");
    });

    it("11枚以上の場合はエラーを返す", () => {
      const files = Array(11).fill(new File([""], "test.jpg", { type: "image/jpeg" }));
      expect(validateImages(files)).toBe("画像は最大10枚までアップロードできます");
    });

    it("10MB超過の場合はエラーを返す", () => {
      const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });
      expect(validateImages([largeFile])).toContain("ファイルサイズが10MBを超えています");
    });

    it("非対応形式の場合はエラーを返す", () => {
      const file = new File([""], "test.bmp", { type: "image/bmp" });
      expect(validateImages([file])).toBe("JPEG, PNG, WebP, GIF形式のみ対応しています");
    });

    it("正常なファイルの場合はnullを返す", () => {
      const file = new File([""], "test.jpg", { type: "image/jpeg" });
      expect(validateImages([file])).toBeNull();
    });
  });

  describe("useUploadImages hook", () => {
    it("アップロード成功時にonSuccessが呼ばれる", async () => {
      const onSuccess = vi.fn();
      const mockMutate = vi.fn();

      vi.mocked(uploadsApi.usePostUploadsImages).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as never);

      const { result } = renderHook(() => useUploadImages({ onSuccess }), { wrapper });

      const files = [new File([""], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      expect(mockMutate).toHaveBeenCalled();
    });

    it("バリデーションエラー時にonErrorが呼ばれる", () => {
      const onError = vi.fn();
      vi.mocked(uploadsApi.usePostUploadsImages).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as never);

      const { result } = renderHook(() => useUploadImages({ onError }), { wrapper });

      const files = Array(11).fill(new File([""], "test.jpg", { type: "image/jpeg" }));
      result.current.uploadImages(files);

      expect(onError).toHaveBeenCalledWith("画像は最大10枚までアップロードできます");
    });

    it("isPendingがtrueの場合、アップロード中を示す", () => {
      vi.mocked(uploadsApi.usePostUploadsImages).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as never);

      const { result } = renderHook(() => useUploadImages(), { wrapper });

      expect(result.current.isPending).toBe(true);
    });
  });
});
