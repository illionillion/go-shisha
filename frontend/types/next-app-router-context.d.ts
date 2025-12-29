// Storybook用: next/dist/shared/lib/app-router-context の型ダミー宣言

declare module "next/dist/shared/lib/app-router-context" {
  export const AppRouterContext: import("react").Context<Record<string, unknown> | null>;
}
