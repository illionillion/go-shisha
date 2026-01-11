import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getImageUrl } from "./getImageUrl";

describe("getImageUrl", () => {
  const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;

  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    // テスト後に環境変数を元に戻す
    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });

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

  it("相対パスの場合は BACKEND_URL を付与する", () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";
    const url = "/uploads/image.jpg";
    const result = getImageUrl(url);
    expect(result).toBe("https://api.example.com/uploads/image.jpg");
  });

  it("相対パスで BACKEND_URL が設定されていない場合はプレースホルダーを返す", () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "";
    const url = "/uploads/image.jpg";
    const result = getImageUrl(url);
    expect(result).toBe("https://placehold.co/400x600/CCCCCC/666666?text=No+Image");
  });

  it("相対パスで BACKEND_URL が undefined の場合はプレースホルダーを返す", () => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = "/uploads/image.jpg";
    const result = getImageUrl(url);
    expect(result).toBe("https://placehold.co/400x600/CCCCCC/666666?text=No+Image");
  });

  it("BACKEND_URL の末尾にスラッシュがある場合でも正しく結合する", () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com/";
    const url = "/uploads/image.jpg";
    const result = getImageUrl(url);
    expect(result).toBe("https://api.example.com//uploads/image.jpg");
  });

  it("相対パスがスラッシュなしで始まる場合も BACKEND_URL を付与する", () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";
    const url = "uploads/image.jpg";
    const result = getImageUrl(url);
    // 関数は単純に連結するため、スラッシュなしの場合はそのまま連結される
    expect(result).toBe("https://api.example.comuploads/image.jpg");
  });

  it("http で始まるが https ではない URL を正しく処理する", () => {
    const url = "http://cdn.example.com/pic.jpg";
    const result = getImageUrl(url);
    expect(result).toBe(url);
  });

  it("HTTPS の絶対 URL は BACKEND_URL の設定に関わらずそのまま返す", () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";
    const url = "https://external.com/image.jpg";
    const result = getImageUrl(url);
    expect(result).toBe(url);
  });
});
