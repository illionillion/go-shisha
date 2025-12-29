import React from "react";

// Storybook専用のAppRouterContextモック（Next内部に依存しない）
export const AppRouterContext = React.createContext<Record<string, unknown> | null>(null);

export const createMockRouter = () => ({
  push: async (_href: unknown) => Promise.resolve(),
  replace: async (_href: unknown) => Promise.resolve(),
  prefetch: async (_href: unknown) => Promise.resolve(),
  back: () => {},
  forward: () => {},
  refresh: () => {},
});

export default AppRouterContext;
