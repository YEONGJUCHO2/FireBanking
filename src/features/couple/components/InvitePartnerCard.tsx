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
  if (window.Kakao?.Share) {
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

      if (!window.Kakao?.Share) {
        throw new Error("Kakao Share is unavailable");
      }

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(javascriptKey);
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
    } catch {
      setShareError("카카오톡 공유창을 열지 못했습니다. 링크 복사를 사용해주세요.");
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-emerald-700">함께 보기</p>
        <h2 className="text-xl font-semibold text-slate-950">배우자에게 공유할 준비</h2>
        <p className="text-sm leading-6 text-slate-600">
          초대를 수락하면 배우자가 같은 FIRE 대시보드를 함께 볼 수 있습니다.
        </p>
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="coupleId" value={coupleId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "링크 만드는 중..." : "배우자 초대 링크 만들기"}
        </button>
      </form>

      {inviteUrl ? (
        <div className="mt-3 grid gap-2">
          <p className="break-all rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {inviteUrl}
          </p>
          <button
            type="button"
            onClick={copyInviteUrl}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {copied ? "복사했어요" : "초대 링크 복사"}
          </button>
          <button
            type="button"
            onClick={shareInviteUrlWithKakao}
            className="rounded-md bg-[#fee500] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#f3dc00]"
          >
            카카오톡으로 보내기
          </button>
          {copyError ? <p className="text-sm text-slate-700">{copyError}</p> : null}
          {shareError ? <p className="text-sm text-slate-700">{shareError}</p> : null}
        </div>
      ) : null}

      {state.error ? <p className="mt-3 text-sm text-red-700">{state.error}</p> : null}
    </section>
  );
}
