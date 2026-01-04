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
});
