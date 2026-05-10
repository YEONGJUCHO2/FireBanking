"use client";

import { useEffect, useState } from "react";

const kakaoSdkUrl = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.0/kakao.min.js";

type KakaoShareMessage = {
  objectType: "text";
  text: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
  buttonTitle: string;
};

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (javascriptKey: string) => void;
  Share?: {
    sendDefault: (message: KakaoShareMessage) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

let kakaoSdkLoadPromise: Promise<void> | null = null;

function toShareableInviteUrl(inviteUrl: string) {
  if (inviteUrl.startsWith("http")) {
    return inviteUrl;
  }

  return new URL(inviteUrl, window.location.origin).toString();
}

function loadKakaoSdk() {
  if (window.Kakao) {
    return Promise.resolve();
  }

  if (kakaoSdkLoadPromise) {
    return kakaoSdkLoadPromise;
  }

  kakaoSdkLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${kakaoSdkUrl}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Kakao SDK load failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = kakaoSdkUrl;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Kakao SDK load failed")), {
      once: true,
    });
    document.head.append(script);
  });

  return kakaoSdkLoadPromise;
}

export function InviteLinkShareActions({ inviteUrl }: { inviteUrl?: string }) {
  const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
  const [message, setMessage] = useState<string | null>(null);
  const [kakaoStatus, setKakaoStatus] = useState<"unconfigured" | "loading" | "ready" | "failed">(
    javascriptKey ? "loading" : "unconfigured",
  );

  useEffect(() => {
    if (!inviteUrl) return;

    if (!javascriptKey) return;

    let cancelled = false;

    loadKakaoSdk()
      .then(() => {
        if (cancelled || !window.Kakao) return;

        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(javascriptKey);
        }

        if (window.Kakao.Share) {
          setKakaoStatus("ready");
          return;
        }

        setKakaoStatus("failed");
      })
      .catch(() => {
        if (!cancelled) {
          setKakaoStatus("failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inviteUrl, javascriptKey]);

  if (!inviteUrl) {
    return (
      <p className="mt-3 text-[12px] leading-[1.5] text-fb-ink-2">
        초대 링크를 다시 만든 뒤 배우자에게 공유할 수 있어요.
      </p>
    );
  }

  async function copyInviteUrl() {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(toShareableInviteUrl(inviteUrl));
      setMessage("초대 링크를 복사했어요.");
    } catch {
      setMessage("복사 권한이 막혔어요. 아래 링크를 직접 선택해서 복사해주세요.");
    }
  }

  async function shareInviteUrlWithKakao() {
    if (!inviteUrl) return;

    const shareableInviteUrl = toShareableInviteUrl(inviteUrl);

    if (!javascriptKey) {
      try {
        await navigator.clipboard.writeText(shareableInviteUrl);
        setMessage("카카오 JavaScript 키가 없어 초대 링크를 복사했어요. 카카오톡에 붙여넣어 보내주세요.");
      } catch {
        setMessage("카카오 JavaScript 키 설정이 필요합니다.");
      }
      return;
    }

    if (kakaoStatus === "loading") {
      setMessage("카카오톡 공유 준비 중이에요. 잠시 후 다시 눌러주세요.");
      return;
    }

    if (kakaoStatus !== "ready" || !window.Kakao?.Share) {
      try {
        await navigator.clipboard.writeText(shareableInviteUrl);
        setMessage("카카오톡 공유 준비가 끝나지 않아 초대 링크를 복사했어요. 카카오톡에 붙여넣어 보내주세요.");
      } catch {
        setMessage("카카오톡 공유 준비가 필요합니다. 아래 링크를 직접 복사해서 카카오톡에 붙여넣어 주세요.");
      }
      return;
    }

    try {
      window.Kakao.Share.sendDefault({
        objectType: "text",
        text: "Fire Banking에서 이번 달 FIRE 금액 3개만 입력해줘.",
        link: {
          mobileWebUrl: shareableInviteUrl,
          webUrl: shareableInviteUrl,
        },
        buttonTitle: "초대 수락하기",
      });
      setMessage(null);
    } catch (error) {
      console.warn("KakaoTalk invite share fallback", error);
      try {
        await navigator.clipboard.writeText(shareableInviteUrl);
        setMessage("카카오톡 공유창이 막혀 초대 링크를 복사했어요. 카카오톡에 붙여넣어 보내주세요.");
      } catch {
        setMessage("카카오톡 공유창이 막혔어요. 아래 링크를 직접 복사해서 카카오톡에 붙여넣어 주세요.");
      }
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <p className="fb-num overflow-hidden text-ellipsis whitespace-nowrap rounded-[10px] bg-fb-card-alt px-3 py-2.5 text-[12px] font-medium text-fb-ink-2">
        {inviteUrl}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copyInviteUrl}
          className="fbpress flex h-[44px] items-center justify-center rounded-[12px] border border-fb-line bg-white text-[13px] font-bold text-fb-ink"
        >
          초대 링크 복사
        </button>
        <button
          type="button"
          onClick={shareInviteUrlWithKakao}
          disabled={kakaoStatus === "loading"}
          aria-busy={kakaoStatus === "loading"}
          className="fbpress flex h-[44px] items-center justify-center rounded-[12px] bg-fb-kakao text-[13px] font-bold text-[#381E1F] disabled:cursor-wait disabled:opacity-60"
        >
          카카오톡 공유
        </button>
      </div>
      {message ? <p className="text-[12px] leading-[1.5] text-fb-ink-2">{message}</p> : null}
    </div>
  );
}
