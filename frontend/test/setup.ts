import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";
// Some dev environments / next versions used in CI don't export
// `AppRouterInstance` from `next/navigation`. Define a minimal local
// shape for tests to avoid typecheck errors while still providing
// the methods we mock below.
type AppRouterInstance = {
  // `push`/`prefetch` may be async in some Next versions; allow Promise or void.
  push?: (...args: unknown[]) => Promise<unknown> | void;
  prefetch?: (...args: unknown[]) => Promise<unknown> | void;
  // `back` is synchronous and returns void in our mocks.
  back?: () => void;
};

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | { src?: string } | undefined;
};

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
  children?: React.ReactNode;
};

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

// Mock next/navigation to avoid app-router invariant in tests
vi.mock("next/navigation", () => ({
  useRouter: () =>
    ({ push: vi.fn(), prefetch: vi.fn(), back: vi.fn() }) as unknown as AppRouterInstance,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image to render a plain <img> in tests
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImageProps) => {
    const { src, alt, ...rest } = props;
    const srcStr = typeof src === "string" ? src : (src?.src ?? "");
    let finalSrc = srcStr;
    // If relative path and backend URL is set, mimic next/image loader encoding
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (typeof srcStr === "string") {
      if (srcStr.startsWith("/")) {
        if (backend) {
          const joined = backend.replace(/\/$/, "") + srcStr;
          finalSrc = encodeURIComponent(joined);
        }
      } else if (backend && srcStr.includes(backend)) {
        // If getImageUrl already produced an absolute URL pointing to backend,
        // mimic next/image's loader behavior by encoding it so tests expecting
        // encoded backend URLs pass.
        finalSrc = encodeURIComponent(srcStr);
      }
    }
    return React.createElement("img", { src: finalSrc, alt, ...rest });
  },
}));

// Mock next/link to render an <a>
vi.mock("next/link", () => ({
  __esModule: true,
  default: (props: LinkProps) =>
    React.createElement("a", { ...props, href: props.href }, props.children),
}));
