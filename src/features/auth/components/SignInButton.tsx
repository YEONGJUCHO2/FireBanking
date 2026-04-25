"use client";

import { useSyncExternalStore } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser";
import {
  buildKakaoExternalBrowserUrl,
  detectInAppBrowser,
  type InAppBrowser,
} from "@/src/features/auth/lib/inAppBrowser";
import type { Provider } from "@supabase/supabase-js";

function subscribeToUserAgent() {
  return () => {};
}

function readInAppBrowser(): InAppBrowser {
  return detectInAppBrowser(window.navigator.userAgent);
}

function readServerInAppBrowser(): InAppBrowser {
  return null;
}

export function SignInButton() {
  const inAppBrowser = useSyncExternalStore(
    subscribeToUserAgent,
    readInAppBrowser,
    readServerInAppBrowser,
  );
  const kakaoAuthEnabled = process.env.NEXT_PUBLIC_KAKAO_AUTH_ENABLED === "true";

  async function signInWithProvider(provider: Provider) {
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  }

  function openExternalBrowser() {
    window.location.href = buildKakaoExternalBrowserUrl(window.location.href);
  }

  return (
    <div className="grid gap-3">
      {inAppBrowser === "kakaotalk" ? (
        <div
          role="alert"
          className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <div className="grid gap-1">
            <p className="font-semibold">
              {kakaoAuthEnabled
                ? "카카오톡 안에서는 카카오 로그인을 권장해요."
                : "카카오톡 안에서는 Google 로그인이 끊길 수 있어요."}
            </p>
            <p className="leading-6">
              {kakaoAuthEnabled
                ? "Google 로그인은 끊길 수 있어서, 이 화면에서는 카카오 로그인을 먼저 사용해주세요."
                : "안정적으로 로그인하려면 Safari나 Chrome 같은 외부 브라우저에서 열어주세요."}
            </p>
          </div>
          <button
            type="button"
            onClick={openExternalBrowser}
            className="w-full rounded-md border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-100 sm:w-fit"
          >
            외부 브라우저로 열기
          </button>
        </div>
      ) : null}
      {kakaoAuthEnabled ? (
        <button
          type="button"
          onClick={() => signInWithProvider("kakao")}
          className="w-full rounded-md bg-[#FEE500] px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-[#f5dc00] sm:w-fit"
        >
          카카오로 시작하기
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => signInWithProvider("google")}
        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:w-fit"
      >
        Google로 시작하기
      </button>
    </div>
  );
}
