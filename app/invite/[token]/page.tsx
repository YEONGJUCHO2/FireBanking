import { SignInButton } from "@/src/features/auth/components/SignInButton";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { AcceptInviteCard } from "@/src/features/couple/components/AcceptInviteCard";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getCurrentUser();
  const nextPath = `/invite/${token}`;

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-slate-950">
      <div className="mx-auto grid max-w-2xl gap-6">
        {user ? (
          <AcceptInviteCard token={token} />
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium text-emerald-700">함께 보기 초대</p>
              <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">
                로그인하고 초대를 수락해요
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                로그인 후 이 초대 페이지로 돌아와 배우자 워크스페이스에 참여합니다.
              </p>
            </div>
            <div className="mt-4">
              <SignInButton
                callbackPath={`/auth/callback?next=${encodeURIComponent(nextPath)}`}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
