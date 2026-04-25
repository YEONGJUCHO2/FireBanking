import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignInButton } from "./SignInButton";

const signInWithOAuth = vi.fn();

vi.mock("@/src/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithOAuth,
    },
  }),
}));

describe("SignInButton", () => {
  beforeEach(() => {
    signInWithOAuth.mockReset();
    vi.restoreAllMocks();
  });

  it("starts Google OAuth with the current origin callback", async () => {
    signInWithOAuth.mockResolvedValue({});
    render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: "Google로 시작하기" }));

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    });
  });

  it("warns KakaoTalk users to open the login page in an external browser", async () => {
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 KAKAOTALK 11.4.0");

    render(<SignInButton />);

    expect(
      await screen.findByText("카카오톡 안에서는 Google 로그인이 끊길 수 있어요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "외부 브라우저로 열기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Google로 시작하기" })).toBeInTheDocument();
  });
});
