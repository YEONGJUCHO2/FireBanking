"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateFireProjection } from "@/src/features/fire/lib/calculateFireProjection";
import { r0OnboardingSchema } from "@/src/features/onboarding/lib/r0OnboardingSchema";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

function currentMonthDate() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export type SaveR0SnapshotState = {
  error?: string;
};

export async function saveR0Snapshot(
  _state: SaveR0SnapshotState,
  formData: FormData,
): Promise<SaveR0SnapshotState> {
  const parsed = r0OnboardingSchema.safeParse({
    targetMonthlyExpense: formData.get("targetMonthlyExpense"),
    monthlyNetIncome: formData.get("monthlyNetIncome"),
    investableNetWorth: formData.get("investableNetWorth"),
    monthlyTotalExpense: formData.get("monthlyTotalExpense"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const displayName = user.user_metadata.full_name ?? user.email ?? "리드 파트너";

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    display_name: displayName,
  });

  if (profileError) {
    return { error: "프로필을 저장하지 못했습니다." };
  }

  const { data: existingMembership, error: membershipLookupError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipLookupError) {
    return { error: "워크스페이스 정보를 불러오지 못했습니다." };
  }

  let coupleId = existingMembership?.couple_id as string | undefined;

  if (!coupleId) {
    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .insert({ name: `${displayName}님의 FIRE 워크스페이스`, created_by: user.id })
      .select("id")
      .single();

    if (coupleError || !couple) {
      return { error: "워크스페이스를 만들지 못했습니다." };
    }

    coupleId = couple.id;

    const { error: memberError } = await supabase.from("couple_members").insert({
      couple_id: coupleId,
      user_id: user.id,
      role: "admin",
    });

    if (memberError) {
      const { data: recoveredMembership } = await supabase
        .from("couple_members")
        .select("couple_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!recoveredMembership) {
        return { error: "리드 파트너 역할을 저장하지 못했습니다." };
      }

      coupleId = recoveredMembership.couple_id;
    }
  }

  const month = currentMonthDate();
  const projection = calculateFireProjection({
    investableNetWorth: parsed.data.investableNetWorth,
    primaryResidenceNetWorth: 0,
    otherNetWorth: 0,
    monthlyNetIncome: parsed.data.monthlyNetIncome,
    targetMonthlyExpense: parsed.data.targetMonthlyExpense,
    monthlyFixedExpense: parsed.data.monthlyTotalExpense,
    monthlyVariableExpense: 0,
    monthlyDebtInterestExpense: 0,
    monthlyDebtPrincipalPayment: 0,
    monthlyRegularInvestment: 0,
    annualReturnRate: 0.05,
    fireMultiplier: 25,
    startDate: new Date(month),
  });

  const { error: snapshotError } = await supabase.from("monthly_cashflow_snapshots").upsert(
    {
      couple_id: coupleId,
      created_by: user.id,
      month,
      total_income: parsed.data.monthlyNetIncome,
      investable_net_worth: parsed.data.investableNetWorth,
      primary_residence_net_worth: 0,
      other_net_worth: 0,
      total_net_worth_for_display: projection.totalNetWorthForDisplay,
      fire_calculation_net_worth: projection.fireCalculationNetWorth,
      fixed_expense: parsed.data.monthlyTotalExpense,
      variable_expense: 0,
      regular_investment: 0,
      remaining_cash: projection.remainingCash,
      monthly_asset_growth_capacity: projection.monthlyAssetGrowthCapacity,
      annual_fire_expense: projection.annualLivingExpense,
      fire_target_asset: projection.fireTargetAsset,
      projected_fire_date: projection.projectedFireDate
        ? projection.projectedFireDate.toISOString().slice(0, 10)
        : null,
    },
    { onConflict: "couple_id,month" },
  );

  if (snapshotError) {
    return { error: "이번 달 스냅샷을 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  redirect("/onboarding/result");
}
