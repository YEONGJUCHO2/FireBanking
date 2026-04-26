"use client";

import { useActionState } from "react";
import {
  acceptInvite,
  type AcceptInviteState,
} from "@/src/features/couple/actions/acceptInvite";

const initialState: AcceptInviteState = {};

export function AcceptInviteCard({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvite, initialState);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-emerald-700">함께 보기 초대</p>
        <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">
          배우자 워크스페이스에 참여해요
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          초대를 수락하면 같은 FIRE 대시보드를 함께 볼 수 있습니다. 배우자 입력은 다음 단계에서
          이어집니다.
        </p>
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
        >
          {pending ? "수락 중..." : "초대 수락하기"}
        </button>
      </form>

      {state.error ? <p className="mt-3 text-sm text-red-700">{state.error}</p> : null}
    </section>
  );
}
