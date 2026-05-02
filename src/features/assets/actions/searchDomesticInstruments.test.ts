import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DomesticInstrument, DomesticValuationProvider } from "../lib/domesticValuationProvider";
import { searchDomesticInstrumentsWithProvider } from "./searchDomesticInstruments";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

function createFormData(query: string) {
  const formData = new FormData();
  formData.set("query", query);
  return formData;
}

function createProvider(): DomesticValuationProvider {
  const instruments = [
    {
      market: "KR",
      symbol: "005930",
      displayName: "삼성전자",
      instrumentType: "stock",
      currency: "KRW",
      lastClosePrice: 85_300,
    },
    {
      market: "KR",
      symbol: "360750",
      displayName: "TIGER 미국S&P500",
      instrumentType: "etf",
      currency: "KRW",
      lastClosePrice: 21_000,
    },
  ] satisfies DomesticInstrument[];

  return {
    searchInstruments: vi.fn(async () => instruments),
    getLastClosePrice: vi.fn(),
  };
}

function createSupabaseMock({
  user = { id: "user-1" },
  upsertError = null,
}: {
  user?: { id: string } | null;
  upsertError?: unknown;
} = {}) {
  const select = vi.fn(async () => ({
    data: [
      {
        id: "instrument-samsung",
        market: "KR",
        symbol: "005930",
        display_name: "삼성전자",
        instrument_type: "stock",
        currency: "KRW",
      },
      {
        id: "instrument-tiger",
        market: "KR",
        symbol: "360750",
        display_name: "TIGER 미국S&P500",
        instrument_type: "etf",
        currency: "KRW",
      },
    ],
    error: upsertError,
  }));
  const upsert = vi.fn(() => ({ select }));
  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
    },
    from: vi.fn((table: string) => {
      if (table !== "asset_instruments") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return { upsert };
    }),
  };

  return { supabase, upsert, select };
}

describe("searchDomesticInstrumentsWithProvider", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
  });

  it("returns domestic stock and ETF results from the provider", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await searchDomesticInstrumentsWithProvider(
      {},
      createFormData("삼성"),
      createProvider(),
    );

    expect(result.instruments).toEqual([
      {
        id: "instrument-samsung",
        market: "KR",
        symbol: "005930",
        displayName: "삼성전자",
        instrumentType: "stock",
        currency: "KRW",
        lastClosePrice: 85_300,
      },
      {
        id: "instrument-tiger",
        market: "KR",
        symbol: "360750",
        displayName: "TIGER 미국S&P500",
        instrumentType: "etf",
        currency: "KRW",
        lastClosePrice: 21_000,
      },
    ]);
  });

  it("upserts searched domestic instruments into asset_instruments", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    await searchDomesticInstrumentsWithProvider({}, createFormData("미국"), createProvider());

    expect(refs.upsert).toHaveBeenCalledWith(
      [
        {
          market: "KR",
          symbol: "005930",
          display_name: "삼성전자",
          instrument_type: "stock",
          currency: "KRW",
        },
        {
          market: "KR",
          symbol: "360750",
          display_name: "TIGER 미국S&P500",
          instrument_type: "etf",
          currency: "KRW",
        },
      ],
      { onConflict: "market,symbol" },
    );
  });

  it("returns provider search results without upserting when the user is signed out", async () => {
    const refs = createSupabaseMock({ user: null });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await searchDomesticInstrumentsWithProvider(
      {},
      createFormData("삼성"),
      createProvider(),
    );

    expect(result.instruments).toEqual([
      {
        id: "search-005930",
        market: "KR",
        symbol: "005930",
        displayName: "삼성전자",
        instrumentType: "stock",
        currency: "KRW",
        lastClosePrice: 85_300,
      },
      {
        id: "search-360750",
        market: "KR",
        symbol: "360750",
        displayName: "TIGER 미국S&P500",
        instrumentType: "etf",
        currency: "KRW",
        lastClosePrice: 21_000,
      },
    ]);
    expect(refs.upsert).not.toHaveBeenCalled();
  });

  it("does not show US-listed tickers such as VOO as auto-valuation candidates", async () => {
    const provider = createProvider();

    const result = await searchDomesticInstrumentsWithProvider({}, createFormData("VOO"), provider);

    expect(result).toEqual({ instruments: [] });
    expect(provider.searchInstruments).not.toHaveBeenCalled();
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns a Korean error when the provider is unavailable", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await searchDomesticInstrumentsWithProvider({}, createFormData("삼성"), null);

    expect(result).toEqual({
      error: "종목 검색을 준비 중이에요. 잠시 후 다시 시도해주세요.",
    });
  });
});
