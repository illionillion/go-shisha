import { describe, it, expect } from "vitest";
import { getImageUrl } from "./getImageUrl";

describe("getImageUrl", () => {
  it("url が undefined の場合はプレースホルダーを返す", () => {
    const result = getImageUrl(undefined);
    expect(result).toBe("https://placehold.co/400x600/CCCCCC/666666?text=No+Image");
  });

  it("url が空文字の場合はプレースホルダーを返す", () => {
    const result = getImageUrl("");
    expect(result).toBe("https://placehold.co/400x600/CCCCCC/666666?text=No+Image");
  });

  it("http:// で始まる絶対 URL の場合はそのまま返す", () => {
    const url = "http://example.com/image.jpg";
    const result = getImageUrl(url);
    expect(result).toBe(url);
  });

  it("https:// で始まる絶対 URL の場合はそのまま返す", () => {
    const url = "https://example.com/image.png";
    const result = getImageUrl(url);
    expect(result).toBe(url);
  });

  it("相対パスはそのまま返す", () => {
    const result = getImageUrl("/images/foo.jpg");
    expect(result).toBe("/images/foo.jpg");
  });

  it("先頭にスラッシュがない相対パスは補完して返す", () => {
    const result = getImageUrl("images/foo.jpg");
    expect(result).toBe("/images/foo.jpg");
  });

  it("先頭に複数スラッシュがある相対パスは正規化して返す", () => {
    const result = getImageUrl("///images/foo.jpg");
    expect(result).toBe("/images/foo.jpg");
  });
});
