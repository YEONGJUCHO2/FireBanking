import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { R0OnboardingForm } from "@/src/features/onboarding/components/R0OnboardingForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 text-slate-950">
      <div className="mx-auto grid max-w-2xl gap-8">
        <section className="grid gap-3">
          <p className="text-sm font-medium text-emerald-700">R0 Internal Alpha</p>
          <h1 className="text-3xl font-bold tracking-normal">
            먼저 신뢰할 수 있는 첫 결과를 확인해요
          </h1>
          <p className="text-base leading-7 text-slate-700">
            R0에서는 자가 부동산을 FIRE 계산에서 분리하고, 투자가능 순자산 기준으로 경제적 자유까지의
            거리를 확인합니다. 정확하지 않아도 괜찮아요. 지금은 첫 거리감을 보는 단계예요.
          </p>
        </section>
        <R0OnboardingForm />
      </div>
    </main>
  );
}
