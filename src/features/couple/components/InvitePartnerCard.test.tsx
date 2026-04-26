import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvitePartnerCard } from "./InvitePartnerCard";

vi.mock("@/src/features/couple/actions/createInviteLink", () => ({
  createInviteLink: vi.fn(),
}));

describe("InvitePartnerCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    Reflect.deleteProperty(window, "Kakao");
  });

  it("explains that invitees can now accept the shared dashboard invite", () => {
    render(<InvitePartnerCard coupleId="couple-1" />);

    expect(
      screen.getByText("초대를 수락하면 배우자가 같은 FIRE 대시보드를 함께 볼 수 있습니다."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/R1/)).not.toBeInTheDocument();
  });

  it("copies an absolute shareable invite URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "초대 링크 복사" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/invite/token-1`);
    });
    expect(screen.getByRole("button", { name: "복사했어요" })).toBeInTheDocument();
  });

  it("shows a copy fallback when clipboard permission is blocked", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "초대 링크 복사" }));

    await waitFor(() => {
      expect(
        screen.getByText("복사 권한이 막혔어요. 초대 링크를 직접 선택해서 복사해주세요."),
      ).toBeInTheDocument();
    });
  });

  it("shares an invite link through KakaoTalk when the JavaScript SDK is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY", "javascript-key");
    const sendDefault = vi.fn();
    const init = vi.fn();
    Object.defineProperty(window, "Kakao", {
      configurable: true,
      value: {
        isInitialized: vi.fn(() => false),
        init,
        Share: { sendDefault },
      },
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡으로 보내기" }));

    await waitFor(() => {
      expect(init).toHaveBeenCalledWith("javascript-key");
      expect(sendDefault).toHaveBeenCalledWith({
        objectType: "text",
        text: "Fire Banking에서 FIRE 대시보드를 함께 보자.",
        link: {
          mobileWebUrl: `${window.location.origin}/invite/token-1`,
          webUrl: `${window.location.origin}/invite/token-1`,
        },
        buttonTitle: "초대 수락하기",
      });
    });
  });

  it("initializes Kakao before checking the Share module", async () => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY", "javascript-key");
    const sendDefault = vi.fn();
    const kakao = {
      isInitialized: vi.fn(() => false),
      init: vi.fn(() => {
        Object.assign(kakao, { Share: { sendDefault } });
      }),
    };
    Object.defineProperty(window, "Kakao", {
      configurable: true,
      value: kakao,
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡으로 보내기" }));

    await waitFor(() => {
      expect(kakao.init).toHaveBeenCalledWith("javascript-key");
      expect(sendDefault).toHaveBeenCalled();
    });
  });

  it("shows a setup message when the Kakao JavaScript key is missing", async () => {
    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡으로 보내기" }));

    expect(
      await screen.findByText("카카오 JavaScript 키 설정이 필요합니다."),
    ).toBeInTheDocument();
  });

  it("copies the invite link when the Kakao share popup is blocked", async () => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY", "javascript-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(window, "Kakao", {
      configurable: true,
      value: {
        isInitialized: vi.fn(() => true),
        init: vi.fn(),
        Share: {
          sendDefault: vi.fn(() => {
            throw new TypeError("Cannot read properties of null (reading 'focus')");
          }),
        },
      },
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡으로 보내기" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/invite/token-1`);
    });
    expect(
      screen.getByText("카카오톡 공유창이 막혀 초대 링크를 복사했어요. 카카오톡에 붙여넣어 보내주세요."),
    ).toBeInTheDocument();
  });

  it("keeps the visible link available when popup and clipboard are both blocked", async () => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY", "javascript-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new DOMException("blocked")) },
    });
    Object.defineProperty(window, "Kakao", {
      configurable: true,
      value: {
        isInitialized: vi.fn(() => true),
        init: vi.fn(),
        Share: {
          sendDefault: vi.fn(() => {
            throw new TypeError("Cannot read properties of null (reading 'focus')");
          }),
        },
      },
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡으로 보내기" }));

    expect(
      await screen.findByText(
        "카카오톡 공유창이 막혔어요. 아래 초대 링크를 복사해서 카카오톡에 붙여넣어 주세요.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("/invite/token-1")).toBeInTheDocument();
  });
});
