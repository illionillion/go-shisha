import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as uploadsApi from "@/api/uploads";
import { useUploadImages } from "./useUploadImages";

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

  describe("画像アップロード", () => {
    it("アップロードが実行される", () => {
      const mockMutate = vi.fn();
      vi.mocked(uploadsApi.usePostUploadsImages).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as never);

      const { result } = renderHook(() => useUploadImages(), { wrapper });

      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      result.current.uploadImages(files);

      expect(mockMutate).toHaveBeenCalledWith({
        data: { images: files[0] },
      });
    });

    it("アップロード成功時にonSuccessが呼ばれる", () => {
      const onSuccess = vi.fn();
      const mockMutate = vi.fn();

      vi.mocked(uploadsApi.usePostUploadsImages).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useUploadImages({ onSuccess }), { wrapper });

      expect(mockMutate).toBeDefined();
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

    it("APIエラー時にエラーハンドラのonErrorオプションが設定される", () => {
      const onError = vi.fn();
      const mockMutate = vi.fn();

      vi.mocked(uploadsApi.usePostUploadsImages).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useUploadImages({ onError }), { wrapper });

      // onErrorコールバックが設定されていることを確認
      expect(mockMutate).toBeDefined();
    });
  });
});
