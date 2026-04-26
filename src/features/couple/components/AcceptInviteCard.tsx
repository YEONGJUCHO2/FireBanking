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
    <section className="fb-card p-6">
      <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-fb-sand text-3xl">
        ✉
      </div>
      <div className="grid gap-2 text-center">
        <p className="text-sm font-bold text-fb-green">초대 수락</p>
        <h1 className="text-2xl font-bold tracking-normal text-fb-ink sm:text-3xl">
          배우자 워크스페이스에 참여해요
        </h1>
        <p className="text-sm leading-6 text-fb-muted">
          초대를 수락하면 같은 FIRE 대시보드를 함께 볼 수 있습니다. 배우자 입력은 다음 단계에서
          이어집니다.
        </p>
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          disabled={pending}
          className="fb-focus w-full rounded-button bg-fb-green px-4 py-3 text-sm font-bold text-white shadow-card hover:bg-fb-green-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "수락 중..." : "초대 수락하기"}
        </button>
      </form>

      {state.error ? <p className="mt-3 text-sm text-fb-danger">{state.error}</p> : null}
    </section>
  );
}
