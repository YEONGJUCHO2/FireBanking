import { describe, expect, it, vi } from "vitest";
import type { DomesticValuationProvider } from "../lib/domesticValuationProvider";
import {
  syncDailyDomesticPrices,
  type SyncDailyDomesticPricesSupabase,
} from "./syncDailyDomesticPrices";

function createProvider(overrides: Partial<DomesticValuationProvider> = {}): DomesticValuationProvider {
  return {
    searchInstruments: vi.fn(),
    getLastClosePrice: vi.fn(async (symbol: string) => ({
      symbol,
      valuationDate: "2026-05-29",
      closePrice: symbol === "005930" ? 85_000 : 18_220,
      provider: "fake",
      fetchedAt: "2026-05-30T00:00:00.000Z",
    })),
    ...overrides,
  };
}

function createSupabaseMock() {
  const upsert = vi.fn(async () => ({ error: null }));
  const holdings = [
    { asset_instruments: { id: "instrument-samsung", symbol: "005930", is_active: true } },
    { asset_instruments: { id: "instrument-tiger", symbol: "360750", is_active: true } },
    { asset_instruments: { id: "instrument-samsung", symbol: "005930", is_active: true } },
  ];
  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "asset_holdings") {
        return { select: vi.fn(async () => ({ data: holdings, error: null })) };
      }
      if (table === "asset_price_snapshots") {
        return { upsert };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
  return { supabase: supabase as unknown as SyncDailyDomesticPricesSupabase, upsert };
}

describe("syncDailyDomesticPrices", () => {
  it("stores close prices for active domestic holdings", async () => {
    const refs = createSupabaseMock();

    const result = await syncDailyDomesticPrices({
      supabase: refs.supabase,
      provider: createProvider(),
      asOfDate: "2026-05-30",
    });

    expect(result).toEqual({ synced: 2, skipped: 0, failed: 0 });
    expect(refs.upsert).toHaveBeenCalledTimes(2);
    expect(refs.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        instrument_id: "instrument-samsung",
        valuation_date: "2026-05-29",
        close_price: 85_000,
        provider: "fake",
      }),
      { onConflict: "instrument_id,valuation_date,provider" },
    );
  });

  it("keeps the last stored price when provider returns null", async () => {
    const refs = createSupabaseMock();
    const provider = createProvider({
      getLastClosePrice: vi.fn(async () => null),
    });

    const result = await syncDailyDomesticPrices({
      supabase: refs.supabase,
      provider,
      asOfDate: "2026-05-30",
    });

    expect(result).toEqual({ synced: 0, skipped: 2, failed: 0 });
    expect(refs.upsert).not.toHaveBeenCalled();
  });

  it("returns a warning count when provider throws", async () => {
    const refs = createSupabaseMock();
    const provider = createProvider({
      getLastClosePrice: vi.fn(async () => {
        throw new Error("provider down");
      }),
    });

    const result = await syncDailyDomesticPrices({
      supabase: refs.supabase,
      provider,
      asOfDate: "2026-05-30",
    });

    expect(result).toEqual({ synced: 0, skipped: 0, failed: 2 });
  });
});
