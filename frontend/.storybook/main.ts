import type { StorybookConfig } from "@storybook/nextjs-vite";
import type { InlineConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-onboarding"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  viteFinal: async (config: InlineConfig, { configType }) => {
    if (configType === "PRODUCTION") {
      config.base = "./";
    }
    return config;
  },
};
export default config;
