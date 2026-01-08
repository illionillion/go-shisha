import { describe, test, expect } from "vitest";
import { render, screen } from "@/test/utils";
import type { User } from "@/types/domain";
import { ProfileHeader } from "./ProfileHeader";

const mockUser: User = {
  id: 7,
  display_name: "テストユーザー",
  icon_url: "/avatar.png",
  description: "これは自己紹介です",
  external_url: "https://example.com",
};

describe("ProfileHeader", () => {
  test("ユーザー名・説明・外部URL を表示する", () => {
    render(<ProfileHeader user={mockUser} />);
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    expect(screen.getByText("これは自己紹介です")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: mockUser.external_url })).toHaveAttribute(
      "href",
      mockUser.external_url
    );
  });

  test("external_url がない場合はリンクを表示しない", () => {
    const u = { ...mockUser, external_url: undefined } as User;
    render(<ProfileHeader user={u} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("display_name が undefined の場合は「名無しのユーザー」を表示する", () => {
    const u = { ...mockUser, display_name: undefined } as User;
    render(<ProfileHeader user={u} />);
    expect(screen.getByText("名無しのユーザー")).toBeInTheDocument();
  });

  test("display_name が null の場合は「名無しのユーザー」を表示する", () => {
    const u = { ...mockUser, display_name: null } as unknown as User;
    render(<ProfileHeader user={u} />);
    expect(screen.getByText("名無しのユーザー")).toBeInTheDocument();
  });

  test("description が undefined の場合は説明を表示しない", () => {
    const u = { ...mockUser, description: undefined } as User;
    render(<ProfileHeader user={u} />);
    expect(screen.queryByText("これは自己紹介です")).toBeNull();
  });

  test("description が null の場合は説明を表示しない", () => {
    const u = { ...mockUser, description: null } as unknown as User;
    render(<ProfileHeader user={u} />);
    expect(screen.queryByText("これは自己紹介です")).toBeNull();
  });

  test("icon_url が undefined の場合は null として Avatar に渡される", () => {
    const u = { ...mockUser, icon_url: undefined } as User;
    render(<ProfileHeader user={u} />);
    // SVGフォールバックが表示される（imgタグがないことを確認）
    const avatarWrapper = screen.getByRole("img", { name: "テストユーザー" });
    expect(avatarWrapper).toBeInTheDocument();
    expect(avatarWrapper.querySelector("img")).toBeNull();
    expect(avatarWrapper.querySelector("svg")).toBeTruthy();
  });

  test("icon_url が null の場合は Avatar にそのまま渡される", () => {
    const u = { ...mockUser, icon_url: null } as unknown as User;
    render(<ProfileHeader user={u} />);
    const avatarWrapper = screen.getByRole("img", { name: "テストユーザー" });
    expect(avatarWrapper).toBeInTheDocument();
    expect(avatarWrapper.querySelector("img")).toBeNull();
    expect(avatarWrapper.querySelector("svg")).toBeTruthy();
  });
});
