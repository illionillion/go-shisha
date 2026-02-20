import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import PostDetailCarousel from "./PostDetailCarousel";

vi.mock("@/lib/getImageUrl", () => ({ getImageUrl: (u: string) => u }));

describe("PostDetailCarousel", () => {
  test("No Image 表示と戻るボタン動作", async () => {
    const handleBack = vi.fn();
    render(
      <PostDetailCarousel
        slides={[]}
        current={0}
        onPrev={() => {}}
        onNext={() => {}}
        onDotClick={() => {}}
        handleBack={handleBack}
      />
    );

    expect(screen.getByText("No Image")).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: /戻る/ });
    await userEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalled();
  });

  test("スライドがある場合に画像表示とドット操作が動く", async () => {
    const handleBack = vi.fn();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onDotClick = vi.fn();

    const slides = [
      { image_url: "https://example.com/a.jpg", text: "S1" },
      { image_url: "https://example.com/b.jpg", text: "S2" },
    ];

    render(
      <PostDetailCarousel
        slides={slides as unknown as Array<Record<string, unknown>>}
        current={0}
        onPrev={onPrev}
        onNext={onNext}
        onDotClick={onDotClick}
        handleBack={handleBack}
      />
    );

    // 次へ/前へボタンが存在する
    const next = screen.getByLabelText("次のスライド");
    await userEvent.click(next);
    expect(onNext).toHaveBeenCalled();

    const prev = screen.getByLabelText("前のスライド");
    await userEvent.click(prev);
    expect(onPrev).toHaveBeenCalled();

    const dot2 = screen.getByRole("button", { name: /スライド 2/ });
    await userEvent.click(dot2);
    expect(onDotClick).toHaveBeenCalledWith(1);
  });

  test("スライドのtextがない場合にalt属性が「投稿画像」になる", () => {
    const slides = [{ image_url: "https://example.com/a.jpg", text: undefined }];

    render(
      <PostDetailCarousel
        slides={slides as unknown as Array<Record<string, unknown>>}
        current={0}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onDotClick={vi.fn()}
        handleBack={vi.fn()}
      />
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "投稿画像");
  });
});
