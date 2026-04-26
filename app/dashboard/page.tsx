import { redirect } from "next/navigation";
import { AppHeader } from "@/src/features/auth/components/AppHeader";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { InvitePartnerCard } from "@/src/features/couple/components/InvitePartnerCard";
import { R0Dashboard } from "@/src/features/dashboard/components/R0Dashboard";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const { data: membership } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const { data: snapshot } = await supabase
    .from("monthly_cashflow_snapshots")
    .select(
      "month,total_income,investable_net_worth,primary_residence_net_worth,other_net_worth,total_net_worth_for_display,fire_calculation_net_worth,fixed_expense,variable_expense,regular_investment,remaining_cash,monthly_asset_growth_capacity,annual_fire_expense,fire_target_asset,projected_fire_date",
    )
    .eq("couple_id", membership.couple_id)
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!snapshot) {
    redirect("/onboarding");
  }

  const { data: latestInvite } = await supabase
    .from("couple_invites")
    .select("token")
    .eq("couple_id", membership.couple_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <AppHeader
          links={[
            { href: "/subscribe", label: "고정비 시뮬레이터" },
            { href: "/onboarding", label: "이번 달 값 수정" },
          ]}
        />
        <R0Dashboard snapshot={snapshot} />
        <InvitePartnerCard
          coupleId={membership.couple_id}
          latestInviteUrl={latestInvite ? `/invite/${latestInvite.token}` : undefined}
        />
      </div>
    </main>
  );
}
