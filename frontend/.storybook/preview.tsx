import type { Preview } from "@storybook/nextjs-vite";
import "../app/globals.css";
import AppRouterContextMock, { createMockRouter } from "./AppRouterContextMock";

const mockAppRouter = createMockRouter();

export const decorators = [
  (Story: React.ComponentType) => (
    <AppRouterContextMock.Provider value={mockAppRouter}>
      <Story />
    </AppRouterContextMock.Provider>
  ),
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo",
    },

    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
