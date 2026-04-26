import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/src/features/auth/components/SignInButton", () => ({
  SignInButton: () => <button type="button">로그인</button>,
}));

describe("HomePage", () => {
  it("describes the current spouse sharing flow", () => {
    render(<HomePage />);

    expect(screen.getByText(/초대 링크나 카카오톡 공유로 배우자에게/)).toBeInTheDocument();
    expect(screen.queryByText(/다음 릴리즈/)).not.toBeInTheDocument();
  });
});
