"use client";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser";

export function SignInButton() {
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

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
    >
      Google로 시작하기
    </button>
  );
}
