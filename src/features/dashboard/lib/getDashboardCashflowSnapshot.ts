import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type DashboardCashflowSnapshot = {
  total_income: number;
  investable_net_worth: number;
  primary_residence_net_worth: number;
  other_net_worth: number;
  total_net_worth_for_display: number;
  fire_calculation_net_worth: number;
  fixed_expense: number;
  variable_expense: number;
  regular_investment: number;
  monthly_asset_growth_capacity: number;
  annual_fire_expense: number;
  fire_target_asset: number;
};

type DashboardCashflowSnapshotRow = Record<keyof DashboardCashflowSnapshot, unknown>;

function currentMonthDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}-01`;
}

export async function getDashboardCashflowSnapshot(): Promise<DashboardCashflowSnapshot | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.couple_id) {
    return null;
  }

  const { data, error } = await supabase
    .from("monthly_cashflow_snapshots")
    .select(
      [
        "total_income",
        "investable_net_worth",
        "primary_residence_net_worth",
        "other_net_worth",
        "total_net_worth_for_display",
        "fire_calculation_net_worth",
        "fixed_expense",
        "variable_expense",
        "regular_investment",
        "monthly_asset_growth_capacity",
        "annual_fire_expense",
        "fire_target_asset",
      ].join(","),
    )
    .eq("couple_id", membership.couple_id)
    .lte("month", currentMonthDate())
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as DashboardCashflowSnapshotRow;

  return {
    total_income: Number(row.total_income),
    investable_net_worth: Number(row.investable_net_worth),
    primary_residence_net_worth: Number(row.primary_residence_net_worth),
    other_net_worth: Number(row.other_net_worth),
    total_net_worth_for_display: Number(row.total_net_worth_for_display),
    fire_calculation_net_worth: Number(row.fire_calculation_net_worth),
    fixed_expense: Number(row.fixed_expense),
    variable_expense: Number(row.variable_expense),
    regular_investment: Number(row.regular_investment),
    monthly_asset_growth_capacity: Number(row.monthly_asset_growth_capacity),
    annual_fire_expense: Number(row.annual_fire_expense),
    fire_target_asset: Number(row.fire_target_asset),
  };
}
