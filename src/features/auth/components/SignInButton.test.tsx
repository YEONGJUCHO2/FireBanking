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
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_KAKAO_AUTH_ENABLED", "true");
  });

  it("starts Google OAuth with the current origin callback", async () => {
    signInWithOAuth.mockResolvedValue({});
    render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /Google로 시작하기/ }));

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });
    });
  });

  it("starts Kakao OAuth with the current origin callback", async () => {
    signInWithOAuth.mockResolvedValue({});
    render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /카카오로 시작하기/ }));

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: "login" },
        },
      });
    });
  });

  it("can preserve an invite return path through OAuth", async () => {
    signInWithOAuth.mockResolvedValue({});
    render(<SignInButton callbackPath="/auth/callback?next=/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: /카카오로 시작하기/ }));

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/invite/token-1`,
          queryParams: { prompt: "login" },
        },
      });
    });
  });

  it("warns KakaoTalk users to open the login page in an external browser", async () => {
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 KAKAOTALK 11.4.0");

    render(<SignInButton />);

    expect(
      await screen.findByText("카카오톡 안에서는 카카오 로그인을 권장해요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "외부 브라우저로 열기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google로 시작하기/ })).toBeInTheDocument();
  });

  it("always renders both Google and Kakao login buttons", () => {
    render(<SignInButton />);

    expect(screen.getByRole("button", { name: /Google로 시작하기/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /카카오로 시작하기/ })).toBeInTheDocument();
  });
});
