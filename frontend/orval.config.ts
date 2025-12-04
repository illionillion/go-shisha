import { defineConfig } from "orval";

export default defineConfig({
  petstore: {
    input: "./openapi/openapi.yml",
    output: {
      mode: "tags",
      target: "./api/generated.ts",
      schemas: "./api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "./lib/api-client.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
