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
    render(
      <ProfileHeader
        displayName={mockUser.display_name}
        iconUrl={mockUser.icon_url}
        bio={mockUser.description}
        externalUrl={mockUser.external_url}
      />
    );
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    expect(screen.getByText("これは自己紹介です")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: mockUser.external_url })).toHaveAttribute(
      "href",
      mockUser.external_url
    );
  });

  test("external_url がない場合はリンクを表示しない", () => {
    render(
      <ProfileHeader
        displayName={mockUser.display_name}
        iconUrl={mockUser.icon_url}
        bio={mockUser.description}
        externalUrl={undefined}
      />
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("display_name が undefined の場合は「名無しのユーザー」を表示する", () => {
    render(
      <ProfileHeader
        displayName={undefined}
        iconUrl={mockUser.icon_url}
        bio={mockUser.description}
        externalUrl={mockUser.external_url}
      />
    );
    expect(screen.getByText("名無しのユーザー")).toBeInTheDocument();
  });

  test("display_name が null の場合は「名無しのユーザー」を表示する", () => {
    render(
      <ProfileHeader
        displayName={null}
        iconUrl={mockUser.icon_url}
        bio={mockUser.description}
        externalUrl={mockUser.external_url}
      />
    );
    expect(screen.getByText("名無しのユーザー")).toBeInTheDocument();
  });

  test("display_name が空文字の場合は「名無しのユーザー」を表示する", () => {
    render(
      <ProfileHeader
        displayName=""
        iconUrl={mockUser.icon_url}
        bio={mockUser.description}
        externalUrl={mockUser.external_url}
      />
    );
    expect(screen.getByText("名無しのユーザー")).toBeInTheDocument();
  });

  test("description が undefined の場合は説明を表示しない", () => {
    render(
      <ProfileHeader
        displayName={mockUser.display_name}
        iconUrl={mockUser.icon_url}
        bio={undefined}
        externalUrl={mockUser.external_url}
      />
    );
    expect(screen.queryByText("これは自己紹介です")).toBeNull();
  });

  test("description が null の場合は説明を表示しない", () => {
    render(
      <ProfileHeader
        displayName={mockUser.display_name}
        iconUrl={mockUser.icon_url}
        bio={null}
        externalUrl={mockUser.external_url}
      />
    );
    expect(screen.queryByText("これは自己紹介です")).toBeNull();
  });

  test("icon_url が undefined の場合は null として Avatar に渡される", () => {
    render(
      <ProfileHeader
        displayName={mockUser.display_name}
        iconUrl={undefined}
        bio={mockUser.description}
        externalUrl={mockUser.external_url}
      />
    );
    // SVGフォールバックが表示される（imgタグがないことを確認）
    const avatarWrapper = screen.getByRole("img", { name: "テストユーザー" });
    expect(avatarWrapper).toBeInTheDocument();
    expect(avatarWrapper.querySelector("img")).toBeNull();
    expect(avatarWrapper.querySelector("svg")).toBeTruthy();
  });

  test("icon_url が null の場合は Avatar にそのまま渡される", () => {
    render(
      <ProfileHeader
        displayName={mockUser.display_name}
        iconUrl={null}
        bio={mockUser.description}
        externalUrl={mockUser.external_url}
      />
    );
    const avatarWrapper = screen.getByRole("img", { name: "テストユーザー" });
    expect(avatarWrapper).toBeInTheDocument();
    expect(avatarWrapper.querySelector("img")).toBeNull();
    expect(avatarWrapper.querySelector("svg")).toBeTruthy();
  });
});
