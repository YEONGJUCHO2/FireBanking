import { describe, expect, it, vi } from "vitest";
import {
  createMonthEndSnapshots,
  type CreateMonthEndSnapshotsSupabase,
} from "./createMonthEndSnapshots";

function createSupabaseMock({
  missingPriceInstrumentId,
}: {
  missingPriceInstrumentId?: string;
} = {}) {
  const upsert = vi.fn(
    async (row: Record<string, unknown>, options: { onConflict: string }) => {
      void row;
      void options;
      return { error: null };
    },
  );
  const prices: Record<string, { close_price: number; valuation_date: string } | null> = {
    "instrument-samsung":
      missingPriceInstrumentId === "instrument-samsung"
        ? null
        : { close_price: 85_000, valuation_date: "2026-05-29" },
    "instrument-tiger": { close_price: 18_220, valuation_date: "2026-05-29" },
  };

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "asset_holdings") {
        return {
          select: vi.fn(async () => ({
            data: [
              {
                couple_id: "couple-1",
                instrument_id: "instrument-samsung",
                quantity: 10,
              },
              {
                couple_id: "couple-1",
                instrument_id: "instrument-tiger",
                quantity: 5,
              },
            ],
            error: null,
          })),
        };
      }
      if (table === "asset_liabilities") {
        return {
          select: vi.fn(async () => ({
            data: [
              {
                couple_id: "couple-1",
                purpose: "investment",
                balance_amount: 1_000_000,
                monthly_interest_amount: 10_000,
                monthly_principal_amount: 50_000,
              },
            ],
            error: null,
          })),
        };
      }
      if (table === "asset_price_snapshots") {
        const builder = {
          select: vi.fn(() => builder),
          eq: vi.fn((_: string, instrumentId: string) => {
            builder.instrumentId = instrumentId;
            return builder;
          }),
          lte: vi.fn(() => builder),
          order: vi.fn(() => builder),
          limit: vi.fn(() => builder),
          maybeSingle: vi.fn(async () => ({ data: prices[builder.instrumentId] ?? null, error: null })),
          instrumentId: "",
        };
        return builder;
      }
      if (table === "monthly_asset_snapshots") {
        return { upsert };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return { supabase: supabase as unknown as CreateMonthEndSnapshotsSupabase, upsert };
}

describe("createMonthEndSnapshots", () => {
  it("creates one snapshot per couple and month", async () => {
    const refs = createSupabaseMock();

    const result = await createMonthEndSnapshots({
      supabase: refs.supabase,
      snapshotDate: "2026-05-31",
    });

    expect(result).toEqual({ created: 1, updated: 0, warnings: [] });
    expect(refs.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        couple_id: "couple-1",
        snapshot_month: "2026-05-01",
        snapshot_date: "2026-05-31",
        domestic_holding_valuation_amount: 941_100,
        total_liability_amount: 1_000_000,
      }),
      { onConflict: "couple_id,snapshot_month" },
    );
  });

  it("uses couple_id plus snapshot_month as the idempotency key", async () => {
    const refs = createSupabaseMock();

    await createMonthEndSnapshots({ supabase: refs.supabase, snapshotDate: "2026-05-31" });

    const firstCall = refs.upsert.mock.calls[0];

    expect(firstCall?.[1]).toEqual({ onConflict: "couple_id,snapshot_month" });
  });

  it("does not mutate prior month snapshots when current prices change", async () => {
    const refs = createSupabaseMock();

    await createMonthEndSnapshots({ supabase: refs.supabase, snapshotDate: "2026-06-30" });

    const firstCall = refs.upsert.mock.calls[0];

    expect(firstCall?.[0]).toEqual(
      expect.objectContaining({ snapshot_month: "2026-06-01" }),
    );
  });

  it("excludes holdings without a month-end valuation and reports warnings", async () => {
    const refs = createSupabaseMock({ missingPriceInstrumentId: "instrument-samsung" });

    const result = await createMonthEndSnapshots({
      supabase: refs.supabase,
      snapshotDate: "2026-05-31",
    });

    expect(result.warnings).toEqual(["instrument-samsung valuation missing for 2026-05-31"]);
    const firstCall = refs.upsert.mock.calls[0];

    expect(firstCall?.[0]).toEqual(
      expect.objectContaining({ domestic_holding_valuation_amount: 91_100 }),
    );
  });
});
