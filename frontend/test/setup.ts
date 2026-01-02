import "@testing-library/jest-dom";
import type { QueryClient } from "@tanstack/react-query";
import type { RenderOptions, RenderResult } from "@testing-library/react";
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
  default: (props: LinkProps) => React.createElement("a", props, props.children),
}));

// Provide a QueryClient for tests that use react-query hooks
vi.mock("@tanstack/react-query", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  const client = new actual.QueryClient();
  return {
    ...actual,
    useQueryClient: () => client,
  } as typeof actual & { useQueryClient: () => QueryClient };
});

// Wrap @testing-library/react's render to provide QueryClientProvider globally
vi.mock("@testing-library/react", async () => {
  const actualRTL =
    await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");
  const rq = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  const client = new rq.QueryClient();

  return {
    ...actualRTL,
    render: (ui: React.ReactElement, options?: RenderOptions): RenderResult =>
      actualRTL.render(ui, {
        wrapper: ({ children }: { children?: React.ReactNode }) =>
          React.createElement(rq.QueryClientProvider, { client }, children),
        ...options,
      }),
  } as typeof actualRTL & {
    render: (ui: React.ReactElement, options?: RenderOptions) => RenderResult;
  };
});
