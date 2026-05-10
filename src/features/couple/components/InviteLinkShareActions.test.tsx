import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InviteLinkShareActions } from "./InviteLinkShareActions";

describe("InviteLinkShareActions", () => {
  afterEach(() => {
    delete window.Kakao;
    document.querySelectorAll('script[src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.0/kakao.min.js"]').forEach((script) => {
      script.remove();
    });
    vi.unstubAllEnvs();
  });

  it("copies an absolute invite URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<InviteLinkShareActions inviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "초대 링크 복사" }));

    expect(writeText).toHaveBeenCalledWith("http://localhost:3000/invite/token-1");
    expect(await screen.findByText("초대 링크를 복사했어요.")).toBeInTheDocument();
  });

  it("shares an invite link through KakaoTalk when the SDK is configured", async () => {
    const init = vi.fn();
    const sendDefault = vi.fn();
    vi.stubEnv("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY", "kakao-js-key");
    window.Kakao = {
      isInitialized: vi.fn(() => false),
      init,
      Share: { sendDefault },
    };

    render(<InviteLinkShareActions inviteUrl="/invite/token-1" />);

    await waitFor(() => expect(init).toHaveBeenCalledWith("kakao-js-key"));
    await waitFor(() => expect(screen.getByRole("button", { name: "카카오톡 공유" })).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button", { name: "카카오톡 공유" }));

    await waitFor(() =>
      expect(sendDefault).toHaveBeenCalledWith(
        expect.objectContaining({
          objectType: "text",
          text: "Fire Banking에서 이번 달 FIRE 금액 3개만 입력해줘.",
          buttonTitle: "초대 수락하기",
          link: {
            mobileWebUrl: "http://localhost:3000/invite/token-1",
            webUrl: "http://localhost:3000/invite/token-1",
          },
        }),
      ),
    );
  });

  it("falls back to copying the invite link when KakaoTalk sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.stubEnv("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY", "");

    render(<InviteLinkShareActions inviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡 공유" }));

    expect(writeText).toHaveBeenCalledWith("http://localhost:3000/invite/token-1");
    expect(
      await screen.findByText("카카오 JavaScript 키가 없어 초대 링크를 복사했어요. 카카오톡에 붙여넣어 보내주세요."),
    ).toBeInTheDocument();
  });
});
