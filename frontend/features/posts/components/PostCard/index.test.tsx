import { describe, test, expect } from "vitest";
import * as idx from "./index";

describe("PostCard index export", () => {
  test("exports PostCard", () => {
    expect(idx.PostCard).toBeDefined();
  });
});
