import type { DomesticValuationProvider } from "@/src/features/assets/lib/domesticValuationProvider";

type HoldingInstrumentRow = {
  asset_instruments:
    | {
        id: string;
        symbol: string;
        is_active: boolean;
      }
    | null;
};

export type SyncDailyDomesticPricesSupabase = {
  from(table: "asset_holdings"): {
    select(columns: string): Promise<{ data: HoldingInstrumentRow[] | null; error: unknown }>;
  };
  from(table: "asset_price_snapshots"): {
    upsert(
      row: Record<string, unknown>,
      options: { onConflict: string },
    ): Promise<{ error: unknown }>;
  };
};

export async function syncDailyDomesticPrices({
  supabase,
  provider,
  asOfDate,
}: {
  supabase: SyncDailyDomesticPricesSupabase;
  provider: DomesticValuationProvider;
  asOfDate: string;
}): Promise<{ synced: number; skipped: number; failed: number }> {
  const { data, error } = await supabase
    .from("asset_holdings")
    .select("asset_instruments(id,symbol,is_active)");

  if (error || !data) {
    return { synced: 0, skipped: 0, failed: 1 };
  }

  const instruments = new Map<string, { id: string; symbol: string }>();
  data.forEach((row) => {
    const instrument = row.asset_instruments;
    if (instrument?.is_active) {
      instruments.set(instrument.id, { id: instrument.id, symbol: instrument.symbol });
    }
  });

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const instrument of instruments.values()) {
    try {
      const close = await provider.getLastClosePrice(instrument.symbol, asOfDate);

      if (!close) {
        skipped += 1;
        continue;
      }

      const { error: upsertError } = await supabase.from("asset_price_snapshots").upsert(
        {
          instrument_id: instrument.id,
          valuation_date: close.valuationDate,
          close_price: close.closePrice,
          provider: close.provider,
          fetched_at: close.fetchedAt,
        },
        { onConflict: "instrument_id,valuation_date,provider" },
      );

      if (upsertError) {
        failed += 1;
        continue;
      }

      synced += 1;
    } catch {
      failed += 1;
    }
  }

  return { synced, skipped, failed };
}
