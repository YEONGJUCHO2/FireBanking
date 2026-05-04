import { calculateAssetSnapshotInputs } from "@/src/features/assets/lib/assetCalculations";
import { getSnapshotMonthDate } from "@/src/features/assets/lib/monthEndSnapshot";
import type { LiabilityInput } from "@/src/features/assets/types";

type HoldingRow = {
  couple_id: string;
  instrument_id: string;
  quantity: number;
};

type LiabilityRow = {
  couple_id: string;
  purpose: LiabilityInput["purpose"];
  balance_amount: number;
  monthly_interest_amount: number;
  monthly_principal_amount: number;
};

type PriceRow = {
  close_price: number;
  valuation_date: string;
};

type PriceBuilder = {
  select(columns: string): PriceBuilder;
  eq(column: string, value: string): PriceBuilder;
  lte(column: string, value: string): PriceBuilder;
  order(column: string, options: { ascending: boolean }): PriceBuilder;
  limit(count: number): PriceBuilder;
  maybeSingle(): Promise<{ data: PriceRow | null; error: unknown }>;
};

export type CreateMonthEndSnapshotsSupabase = {
  from(table: "asset_holdings"): {
    select(columns: string): Promise<{ data: HoldingRow[] | null; error: unknown }>;
  };
  from(table: "asset_liabilities"): {
    select(columns: string): Promise<{ data: LiabilityRow[] | null; error: unknown }>;
  };
  from(table: "asset_price_snapshots"): PriceBuilder;
  from(table: "monthly_asset_snapshots"): {
    upsert(
      row: Record<string, unknown>,
      options: { onConflict: string },
    ): Promise<{ error: unknown }>;
  };
};

async function getLatestPrice(
  supabase: CreateMonthEndSnapshotsSupabase,
  instrumentId: string,
  snapshotDate: string,
) {
  const { data, error } = await supabase
    .from("asset_price_snapshots")
    .select("close_price, valuation_date")
    .eq("instrument_id", instrumentId)
    .lte("valuation_date", snapshotDate)
    .order("valuation_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function createMonthEndSnapshots({
  supabase,
  snapshotDate,
}: {
  supabase: CreateMonthEndSnapshotsSupabase;
  snapshotDate: string;
}): Promise<{ created: number; updated: number; warnings: string[] }> {
  const snapshotMonth = getSnapshotMonthDate(snapshotDate);
  const [{ data: holdings }, { data: liabilities }] = await Promise.all([
    supabase.from("asset_holdings").select("couple_id,instrument_id,quantity"),
    supabase
      .from("asset_liabilities")
      .select("couple_id,purpose,balance_amount,monthly_interest_amount,monthly_principal_amount"),
  ]);
  const warnings: string[] = [];
  const coupleIds = new Set<string>();

  (holdings ?? []).forEach((holding) => coupleIds.add(holding.couple_id));
  (liabilities ?? []).forEach((liability) => coupleIds.add(liability.couple_id));

  let created = 0;

  for (const coupleId of coupleIds) {
    let domesticHoldingValuationAmount = 0;
    let valuationDate: string | null = null;

    for (const holding of (holdings ?? []).filter((row) => row.couple_id === coupleId)) {
      const latestPrice = await getLatestPrice(supabase, holding.instrument_id, snapshotDate);

      if (!latestPrice) {
        warnings.push(`${holding.instrument_id} valuation missing for ${snapshotDate}`);
        continue;
      }

      domesticHoldingValuationAmount += holding.quantity * latestPrice.close_price;
      if (!valuationDate || latestPrice.valuation_date > valuationDate) {
        valuationDate = latestPrice.valuation_date;
      }
    }

    const liabilityInputs: LiabilityInput[] = (liabilities ?? [])
      .filter((row) => row.couple_id === coupleId)
      .map((liability, index) => ({
        id: `${coupleId}-liability-${index}`,
        purpose: liability.purpose,
        balanceAmount: liability.balance_amount,
        monthlyInterestAmount: liability.monthly_interest_amount,
        monthlyPrincipalAmount: liability.monthly_principal_amount,
      }));

    const calculated = calculateAssetSnapshotInputs({
      cashAssetAmount: 0,
      domesticHoldingValuationAmount,
      usListedManualValuationAmount: 0,
      otherInvestmentAmount: 0,
      realEstateAssetAmount: 0,
      otherAssetAmount: 0,
      liabilities: liabilityInputs,
    });

    const { error } = await supabase.from("monthly_asset_snapshots").upsert(
      {
        couple_id: coupleId,
        snapshot_month: snapshotMonth,
        snapshot_date: snapshotDate,
        valuation_date: valuationDate,
        cash_asset_amount: 0,
        domestic_holding_valuation_amount: domesticHoldingValuationAmount,
        us_listed_manual_valuation_amount: 0,
        other_investment_amount: 0,
        investment_asset_amount: calculated.investmentAssetAmount,
        real_estate_asset_amount: 0,
        other_asset_amount: 0,
        total_asset_amount: calculated.totalAssetAmount,
        total_liability_amount: calculated.totalLiabilityAmount,
        displayed_net_worth: calculated.displayedNetWorth,
        fire_calculation_net_worth: calculated.fireCalculationNetWorth,
        monthly_debt_interest_amount: calculated.monthlyDebtInterestAmount,
        monthly_debt_principal_amount: calculated.monthlyDebtPrincipalAmount,
      },
      { onConflict: "couple_id,snapshot_month" },
    );

    if (!error) {
      created += 1;
    }
  }

  return { created, updated: 0, warnings };
}
