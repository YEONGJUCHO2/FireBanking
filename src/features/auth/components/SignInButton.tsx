"use client";

import { useState, useSyncExternalStore } from "react";
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

export function SignInButton({ callbackPath = "/auth/callback" }: { callbackPath?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Provider | null>(null);
  const inAppBrowser = useSyncExternalStore(
    subscribeToUserAgent,
    readInAppBrowser,
    readServerInAppBrowser,
  );

  async function signInWithProvider(provider: Provider) {
    setError(null);
    setPending(provider);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${origin}${callbackPath}` },
      });
      if (oauthError) {
        setError(`로그인 시작에 실패했어요. (${oauthError.message})`);
        setPending(null);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      // Supabase has no provider configured: in dev, fall through to onboarding so
      // designers can verify post-auth screens without a real OAuth round-trip.
      window.location.assign("/onboarding");
    } catch (err) {
      setError(`로그인 도중 오류가 발생했어요. (${(err as Error).message})`);
      setPending(null);
    }
  }

  function openExternalBrowser() {
    window.location.href = buildKakaoExternalBrowserUrl(window.location.href);
  }

  return (
    <div className="grid gap-2.5">
      {inAppBrowser === "kakaotalk" ? (
        <div
          role="alert"
          className="grid gap-3 rounded-card border border-fb-cautionary/25 bg-fb-cautionary-soft p-4 text-sm text-fb-ink"
        >
          <div className="grid gap-1">
            <p className="font-semibold">카카오톡 안에서는 카카오 로그인을 권장해요.</p>
            <p className="leading-6">
              Google 로그인은 끊길 수 있어서, 이 화면에서는 카카오 로그인을 먼저 사용해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={openExternalBrowser}
            className="fb-focus w-full rounded-button border border-fb-cautionary/30 bg-white px-4 py-3 text-sm font-semibold text-fb-ink shadow-card hover:bg-fb-cautionary-soft sm:w-fit"
          >
            외부 브라우저로 열기
          </button>
        </div>
      ) : null}

      {/* G-mail (primary, inverse): black card, Gmail mark, label per prototype */}
      <button
        type="button"
        onClick={() => signInWithProvider("google")}
        disabled={pending !== null}
        className="fb-focus flex h-14 w-full items-center justify-center gap-2.5 rounded-button bg-fb-ink px-4 py-3 text-sm font-bold text-white shadow-card hover:bg-fb-ink/90 disabled:opacity-60"
      >
        <GmailMark />
        G-mail로 시작하기
      </button>

      {/* Kakao (always shown — brand-locked yellow, do not restyle) */}
      <div data-od-id="kakao-login">
        <button
          type="button"
          onClick={() => signInWithProvider("kakao")}
          disabled={pending !== null}
          className="fb-focus flex h-14 w-full items-center justify-center gap-2.5 rounded-button bg-fb-kakao px-4 py-3 text-sm font-bold text-fb-kakao-ink shadow-card hover:brightness-95 disabled:opacity-60"
        >
          <KakaoMark />
          카카오로 계속하기
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-1 text-[12px] font-medium leading-[1.5] text-fb-negative-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GmailMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="shrink-0">
      <path d="M4.5 6.5v11h3.2V9.9L12 13.1l4.3-3.2v7.6h3.2v-11L12 12.1 4.5 6.5Z" fill="#FFFFFF" />
      <path d="M4.5 6.5 12 12.1l7.5-5.6v2.9L12 15 4.5 9.4V6.5Z" fill="#EA4335" />
      <path d="M4.5 9.4v8.1h3.2v-5.7L4.5 9.4Z" fill="#34A853" />
      <path d="M16.3 11.8v5.7h3.2V9.4l-3.2 2.4Z" fill="#4285F4" />
      <path d="M4.5 6.5 12 12.1l2.1-1.6L6.8 5H5.7C5 5 4.5 5.6 4.5 6.5Z" fill="#FBBC04" />
      <path d="M17.2 5 12 8.9l7.5-2.4C19.5 5.6 19 5 18.3 5h-1.1Z" fill="#C5221F" />
    </svg>
  );
}

function KakaoMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 4C7 4 3 7.13 3 11c0 2.42 1.55 4.55 3.9 5.78L5.9 20l3.6-2.05c.81.13 1.65.2 2.5.2 5 0 9-3.13 9-7s-4-7.15-9-7.15Z" />
    </svg>
  );
}
