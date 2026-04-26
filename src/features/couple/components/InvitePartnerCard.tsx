"use client";

import { useActionState, useState } from "react";
import {
  createInviteLink,
  type CreateInviteLinkState,
} from "@/src/features/couple/actions/createInviteLink";

const initialState: CreateInviteLinkState = {};
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

export function InvitePartnerCard({
  coupleId,
  latestInviteUrl,
}: {
  coupleId: string;
  latestInviteUrl?: string;
}) {
  const [state, formAction, pending] = useActionState(createInviteLink, initialState);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const inviteUrl = state.inviteUrl ?? latestInviteUrl;

  async function copyInviteUrl() {
    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(toShareableInviteUrl(inviteUrl));
      setCopyError(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError("복사 권한이 막혔어요. 초대 링크를 직접 선택해서 복사해주세요.");
    }
  }

  async function shareInviteUrlWithKakao() {
    if (!inviteUrl) {
      return;
    }

    const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

    if (!javascriptKey) {
      setShareError("카카오 JavaScript 키 설정이 필요합니다.");
      return;
    }

    try {
      await loadKakaoSdk();

      if (!window.Kakao) {
        throw new Error("Kakao SDK is unavailable");
      }

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(javascriptKey);
      }

      if (!window.Kakao.Share) {
        throw new Error("Kakao Share is unavailable");
      }

      const shareableInviteUrl = toShareableInviteUrl(inviteUrl);
      window.Kakao.Share.sendDefault({
        objectType: "text",
        text: "Fire Banking에서 FIRE 대시보드를 함께 보자.",
        link: {
          mobileWebUrl: shareableInviteUrl,
          webUrl: shareableInviteUrl,
        },
        buttonTitle: "초대 수락하기",
      });
      setShareError(null);
    } catch (error) {
      console.warn("KakaoTalk invite share fallback", error);
      try {
        await navigator.clipboard.writeText(toShareableInviteUrl(inviteUrl));
        setCopyError(null);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
        setShareError(
          "카카오톡 공유창이 막혀 초대 링크를 복사했어요. 카카오톡에 붙여넣어 보내주세요.",
        );
      } catch {
        setShareError(
          "카카오톡 공유창이 막혔어요. 아래 초대 링크를 복사해서 카카오톡에 붙여넣어 주세요.",
        );
      }
    }
  }

  return (
    <section className="fb-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fb-green-100 text-xl text-fb-green">
          ♡
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-bold text-fb-green">배우자 현황</p>
          <h2 className="text-xl font-bold tracking-normal text-fb-ink">함께 보면 결과가 더 또렷해져요.</h2>
          <p className="text-sm leading-6 text-fb-muted">
          초대를 수락하면 배우자가 같은 FIRE 대시보드를 함께 볼 수 있습니다.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="coupleId" value={coupleId} />
        <button
          type="submit"
          disabled={pending}
          className="fb-focus w-full rounded-button bg-fb-green px-4 py-3 text-sm font-bold text-white shadow-card hover:bg-fb-green-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "링크 만드는 중..." : "배우자 초대 링크 만들기"}
        </button>
      </form>

      {inviteUrl ? (
        <div className="mt-3 grid gap-2">
          <p className="break-all rounded-soft bg-fb-green-50 px-3 py-2 text-sm text-fb-muted">
            {inviteUrl}
          </p>
          <button
            type="button"
            onClick={copyInviteUrl}
            className="fb-focus rounded-button border border-fb-line bg-white px-4 py-2 text-sm font-bold text-fb-ink shadow-card hover:border-fb-green/30"
          >
            {copied ? "복사했어요" : "초대 링크 복사"}
          </button>
          <button
            type="button"
            onClick={shareInviteUrlWithKakao}
            className="fb-focus rounded-button bg-fb-kakao px-4 py-2 text-sm font-bold text-[#381E1F] hover:brightness-95"
          >
            카카오톡으로 보내기
          </button>
          {copyError ? <p className="text-sm text-fb-muted">{copyError}</p> : null}
          {shareError ? <p className="text-sm text-fb-muted">{shareError}</p> : null}
        </div>
      ) : null}

      {state.error ? <p className="mt-3 text-sm text-fb-danger">{state.error}</p> : null}
    </section>
  );
}
