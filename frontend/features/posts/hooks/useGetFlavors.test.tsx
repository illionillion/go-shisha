import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode, JSX } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as flavorsApi from "@/api/flavors";
import type { Flavor } from "@/types/domain";
import { useGetFlavors, getFlavorsData } from "./useGetFlavors";

// APIモジュールのモック
vi.mock("@/api/flavors", () => ({
  useGetFlavors: vi.fn(),
}));

describe("useGetFlavors", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("フレーバー一覧を取得できる", async () => {
      const mockFlavors: Flavor[] = [
        { id: 1, name: "ミント", color: "#00FF00" },
        { id: 2, name: "レモン", color: "#FFFF00" },
        { id: 3, name: "グレープ", color: "#800080" },
      ];

      vi.mocked(flavorsApi.useGetFlavors).mockReturnValue({
        data: {
          data: mockFlavors,
          status: 200,
          headers: new Headers(),
        },
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof flavorsApi.useGetFlavors>);

      const { result } = renderHook(() => useGetFlavors(), { wrapper });

      await waitFor(() => {
        expect(result.current.data?.data).toEqual(mockFlavors);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it("キャッシュ設定が正しく適用されている", () => {
      vi.mocked(flavorsApi.useGetFlavors).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof flavorsApi.useGetFlavors>);

      renderHook(() => useGetFlavors(), { wrapper });

      expect(flavorsApi.useGetFlavors).toHaveBeenCalledWith({
        query: expect.objectContaining({
          staleTime: 5 * 60 * 1000, // 5分
          gcTime: 10 * 60 * 1000, // 10分
          retry: false,
        }),
      });
    });
  });

  describe("異常系", () => {
    it("APIエラー時にエラーを返す", async () => {
      const mockError = {
        error: "Internal Server Error",
      };

      vi.mocked(flavorsApi.useGetFlavors).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
      } as ReturnType<typeof flavorsApi.useGetFlavors>);

      const { result } = renderHook(() => useGetFlavors(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中はisLoadingがtrueになる", () => {
      vi.mocked(flavorsApi.useGetFlavors).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof flavorsApi.useGetFlavors>);

      const { result } = renderHook(() => useGetFlavors(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("getFlavorsData ヘルパー関数", () => {
    it("正常なレスポンスからフレーバー配列を取得できる", () => {
      const mockFlavors: Flavor[] = [
        { id: 1, name: "ミント", color: "#00FF00" },
        { id: 2, name: "レモン", color: "#FFFF00" },
      ];

      const mockResponse = {
        data: {
          data: mockFlavors,
          status: 200,
          headers: new Headers(),
        },
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useGetFlavors>;

      const flavors = getFlavorsData(mockResponse);

      expect(flavors).toEqual(mockFlavors);
    });

    it("データが存在しない場合はundefinedを返す", () => {
      const mockResponse = {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useGetFlavors>;

      const flavors = getFlavorsData(mockResponse);

      expect(flavors).toBeUndefined();
    });

    it("非成功レスポンス（4xx/5xx）の場合はundefinedを返す", () => {
      const mockResponse = {
        data: {
          data: { error: "Not Found" },
          status: 404,
          headers: new Headers(),
        },
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useGetFlavors>;

      const flavors = getFlavorsData(mockResponse);

      expect(flavors).toBeUndefined();
    });
  });
});
