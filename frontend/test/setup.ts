import "@testing-library/jest-dom";
import { vi } from "vitest";

/**
 * matchMedia のモック
 * CSSメディアクエリをテスト環境で使用可能にする
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // 非推奨だがレガシー対応
    removeListener: vi.fn(), // 非推奨だがレガシー対応
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
