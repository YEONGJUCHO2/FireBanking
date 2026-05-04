"use server";

import { revalidatePath } from "next/cache";
import { calculateFireProjection } from "@/src/features/fire/lib/calculateFireProjection";
import { fixedCostSimulationConfigSchema } from "@/src/features/subscribe/lib/fixedCostConfigSchema";
import { calculateFixedCostProjection } from "@/src/features/subscribe/lib/fixedCostSimulator";
import type { FixedCostSimulatorConfig } from "@/src/features/subscribe/lib/fixedCostTypes";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type ApplyFireLivingExpenseRecommendationState = {
  applied?: boolean;
  error?: string;
};

function currentMonthDate() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

type SnapshotBaseline = {
  total_income: number;
  investable_net_worth: number;
  primary_residence_net_worth: number;
  other_net_worth: number;
  regular_investment: number;
};

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export async function applyFireLivingExpenseRecommendation(
  config: FixedCostSimulatorConfig,
): Promise<ApplyFireLivingExpenseRecommendationState> {
  const parsed = fixedCostSimulationConfigSchema.safeParse(config);

  if (!parsed.success) {
    return { error: "적용할 입력값을 확인해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    return { error: "리드 파트너만 추천값을 적용할 수 있습니다." };
  }

  const month = currentMonthDate();
  const { data: snapshot, error: snapshotError } = await supabase
    .from("monthly_cashflow_snapshots")
    .select(
      "total_income, investable_net_worth, primary_residence_net_worth, other_net_worth, regular_investment",
    )
    .eq("couple_id", membership.couple_id)
    .eq("month", month)
    .maybeSingle();

  if (snapshotError || !snapshot) {
    return { error: "먼저 이번 달 FIRE 기준값을 입력해주세요." };
  }

  const baseline = snapshot as SnapshotBaseline;
  const livingExpenseProjection = calculateFixedCostProjection(parsed.data);
  const variableWithBuffer =
    livingExpenseProjection.monthlyVariableExpense + livingExpenseProjection.monthlyBufferExpense;
  const fireProjection = calculateFireProjection({
    investableNetWorth: toNumber(baseline.investable_net_worth),
    primaryResidenceNetWorth: toNumber(baseline.primary_residence_net_worth),
    otherNetWorth: toNumber(baseline.other_net_worth),
    monthlyNetIncome: toNumber(baseline.total_income),
    targetMonthlyExpense: livingExpenseProjection.recommendedTargetMonthlyExpense,
    monthlyFixedExpense: livingExpenseProjection.monthlyRecurringFixedExpense,
    monthlyVariableExpense: variableWithBuffer,
    monthlyDebtInterestExpense: 0,
    monthlyDebtPrincipalPayment: 0,
    monthlyRegularInvestment: toNumber(baseline.regular_investment),
    annualReturnRate: parsed.data.annualReturnRate,
    fireMultiplier: 25,
    startDate: new Date(month),
  });

  const { error: updateError } = await supabase
    .from("monthly_cashflow_snapshots")
    .update({
      fixed_expense: livingExpenseProjection.monthlyRecurringFixedExpense,
      variable_expense: variableWithBuffer,
      remaining_cash: fireProjection.remainingCash,
      monthly_asset_growth_capacity: fireProjection.monthlyAssetGrowthCapacity,
      annual_fire_expense: fireProjection.annualLivingExpense,
      fire_target_asset: fireProjection.fireTargetAsset,
      projected_fire_date: fireProjection.projectedFireDate
        ? fireProjection.projectedFireDate.toISOString().slice(0, 10)
        : null,
    })
    .eq("couple_id", membership.couple_id)
    .eq("month", month);

  if (updateError) {
    return { error: "추천값을 대시보드에 적용하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/subscribe");
  return { applied: true };
}
