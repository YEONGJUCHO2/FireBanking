"use client";

import { useActionState, useState } from "react";
import {
  createInviteLink,
  type CreateInviteLinkState,
} from "@/src/features/couple/actions/createInviteLink";

const initialState: CreateInviteLinkState = {};

function toShareableInviteUrl(inviteUrl: string) {
  if (inviteUrl.startsWith("http")) {
    return inviteUrl;
  }

  return new URL(inviteUrl, window.location.origin).toString();
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
  const inviteUrl = state.inviteUrl ?? latestInviteUrl;

  async function copyInviteUrl() {
    if (!inviteUrl) {
      return;
    }

    await navigator.clipboard.writeText(toShareableInviteUrl(inviteUrl));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-emerald-700">함께 보기</p>
        <h2 className="text-xl font-semibold text-slate-950">배우자에게 공유할 준비</h2>
        <p className="text-sm leading-6 text-slate-600">
          R0에서는 링크 생성과 복사 행동으로 공유 의향을 봅니다. 배우자의 가입, 입력, 체크인은 R1에서
          이어집니다.
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
        </div>
      ) : null}

      {state.error ? <p className="mt-3 text-sm text-red-700">{state.error}</p> : null}
    </section>
  );
}
