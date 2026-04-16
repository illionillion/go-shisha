import type { ReactNode } from "react";

/** Storybook用 focus-trap-react パススルーモック */
export function FocusTrap({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
