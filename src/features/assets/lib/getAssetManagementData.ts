import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { HoldingView } from "@/src/features/assets/components/InvestmentAssetPanel";
import type { LiabilityView } from "@/src/features/assets/components/LiabilityPanel";

type AssetManagementData = {
  coupleId: string | null;
  holdings?: HoldingView[];
  liabilities?: LiabilityView[];
};

type InstrumentRow = {
  symbol?: string | null;
  display_name?: string | null;
};

type HoldingRow = {
  id: string;
  quantity: number | string;
  account_category?: HoldingView["accountCategory"] | null;
  asset_instruments?: InstrumentRow | InstrumentRow[] | null;
};

type LiabilityRow = {
  id: string;
  purpose?: LiabilityView["purpose"] | null;
  balance_amount: number | string;
  monthly_interest_amount: number | string;
  monthly_principal_amount: number | string;
};

const domesticPriceSeed: Record<string, { unitPrice: number; valuationDate: string }> = {
  "005930": { unitPrice: 85_000, valuationDate: "2026-05-29" },
  "360750": { unitPrice: 21_000, valuationDate: "2026-05-29" },
  "379810": { unitPrice: 18_500, valuationDate: "2026-05-29" },
};

const liabilityPurposeLabels: Record<NonNullable<LiabilityView["purpose"]>, string> = {
  residence: "거주 부동산",
  investment: "투자 관련",
  lifestyle_credit: "생활/신용",
  other: "기타",
};

export async function getAssetManagementData(): Promise<AssetManagementData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { coupleId: null, holdings: undefined, liabilities: undefined };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.couple_id) {
    return { coupleId: null, holdings: undefined, liabilities: undefined };
  }

  const coupleId = membership.couple_id;
  const [{ data: holdingRows, error: holdingsError }, { data: liabilityRows, error: liabilitiesError }] =
    await Promise.all([
      supabase
        .from("asset_holdings")
        .select(
          "id,quantity,account_category,asset_instruments(symbol,display_name)",
        )
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: true }),
      supabase
        .from("asset_liabilities")
        .select(
          "id,purpose,balance_amount,monthly_interest_amount,monthly_principal_amount",
        )
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: true }),
    ]);

  return {
    coupleId,
    holdings: holdingsError ? [] : mapHoldings((holdingRows ?? []) as HoldingRow[]),
    liabilities: liabilitiesError ? [] : mapLiabilities((liabilityRows ?? []) as LiabilityRow[]),
  };
}

function mapHoldings(rows: HoldingRow[]): HoldingView[] {
  return rows.map((row) => {
    const instrument = Array.isArray(row.asset_instruments)
      ? row.asset_instruments[0]
      : row.asset_instruments;
    const symbol = instrument?.symbol ?? "";
    const quantity = Number(row.quantity);
    const price = domesticPriceSeed[symbol] ?? { unitPrice: 0, valuationDate: "2026-05-29" };

    return {
      id: row.id,
      symbol,
      displayName: instrument?.display_name ?? symbol,
      quantity,
      valuationAmount: Math.round(quantity * price.unitPrice),
      valuationDate: price.valuationDate,
      accountCategory: row.account_category ?? "general",
    };
  });
}

function mapLiabilities(rows: LiabilityRow[]): LiabilityView[] {
  return rows.map((row) => {
    const purpose = row.purpose ?? "other";
    const purposeLabel = liabilityPurposeLabels[purpose] ?? liabilityPurposeLabels.other;

    return {
      id: row.id,
      label: `${purposeLabel} 대출`,
      purposeLabel,
      balanceAmount: Number(row.balance_amount),
      monthlyInterestAmount: Number(row.monthly_interest_amount),
      monthlyPrincipalAmount: Number(row.monthly_principal_amount),
      purpose,
    };
  });
}
