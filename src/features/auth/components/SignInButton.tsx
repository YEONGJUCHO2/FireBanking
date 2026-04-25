"use client";

import { useSyncExternalStore } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser";
import {
  buildKakaoExternalBrowserUrl,
  detectInAppBrowser,
  type InAppBrowser,
} from "@/src/features/auth/lib/inAppBrowser";

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

  async function signInWithGoogle() {
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
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
            <p className="font-semibold">카카오톡 안에서는 Google 로그인이 끊길 수 있어요.</p>
            <p className="leading-6">
              안정적으로 로그인하려면 Safari나 Chrome 같은 외부 브라우저에서 열어주세요.
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
      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 sm:w-fit"
      >
        Google로 시작하기
      </button>
    </div>
  );
}
