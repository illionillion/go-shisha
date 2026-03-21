import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-onboarding"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  /**
   * `@tanstack/react-query` の `build/` ディレクトリが Docker 環境に存在しない場合でも
   * TypeScript ソース (`./src/index.ts`) から直接解決できるよう、カスタム条件を追加する。
   */
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      conditions: ["@tanstack/custom-condition", ...(config.resolve?.conditions ?? [])],
    };
    return config;
  },
};
export default config;
