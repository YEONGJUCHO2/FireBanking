import { redirect } from "next/navigation";
import { AppHeader } from "@/src/features/auth/components/AppHeader";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import {
  R0OnboardingForm,
  type R0OnboardingInitialValues,
} from "@/src/features/onboarding/components/R0OnboardingForm";
import { shouldRedirectOnboardingToDashboard } from "@/src/features/onboarding/lib/onboardingAccess";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const { data: membership } = await supabase
    .from("couple_members")
    .select("couple_id,role")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (shouldRedirectOnboardingToDashboard(membership?.role ?? null)) {
    redirect("/dashboard");
  }

  const { data: snapshot } = membership?.role === "admin"
    ? await supabase
        .from("monthly_cashflow_snapshots")
        .select(
          "total_income,investable_net_worth,primary_residence_net_worth,other_net_worth,fixed_expense,variable_expense,regular_investment",
        )
        .eq("couple_id", membership.couple_id)
        .order("month", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const initialValues: R0OnboardingInitialValues = snapshot
    ? {
        monthlyNetIncome: snapshot.total_income,
        investableNetWorth: snapshot.investable_net_worth,
        primaryResidenceNetWorth: snapshot.primary_residence_net_worth,
        otherNetWorth: snapshot.other_net_worth,
        monthlyFixedExpense: snapshot.fixed_expense,
        monthlyVariableExpense: snapshot.variable_expense,
        monthlyRegularInvestment: snapshot.regular_investment,
      }
    : {};

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-2xl gap-8">
        <AppHeader links={[{ href: "/subscribe", label: "고정비 시뮬레이터" }]} />
        <section className="grid gap-3">
          <p className="text-sm font-medium text-emerald-700">R0 Internal Alpha</p>
          <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">
            먼저 신뢰할 수 있는 첫 결과를 확인해요
          </h1>
          <p className="text-base leading-7 text-slate-700">
            R0에서는 자가 부동산을 FIRE 계산에서 분리하고, 투자가능 순자산 기준으로 경제적 자유까지의
            거리를 확인합니다. 정확하지 않아도 괜찮아요. 지금은 첫 거리감을 보는 단계예요.
          </p>
        </section>
        <R0OnboardingForm initialValues={initialValues} />
      </div>
    </main>
  );
}
