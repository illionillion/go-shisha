import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender } from "@testing-library/react";
import type { RenderResult, RenderOptions } from "@testing-library/react";
import React from "react";

export function render(ui: React.ReactElement, options?: RenderOptions): RenderResult {
  const client = new QueryClient();
  const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export { screen, within, waitFor, act, fireEvent, cleanup } from "@testing-library/react";
export type { RenderResult } from "@testing-library/react";
