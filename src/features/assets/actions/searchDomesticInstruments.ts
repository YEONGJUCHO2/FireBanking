"use server";

import type {
  DomesticInstrument,
  DomesticInstrumentType,
  DomesticValuationProvider,
} from "@/src/features/assets/lib/domesticValuationProvider";
import {
  createKiwoomConfig,
  createKiwoomDomesticValuationProvider,
} from "@/src/features/assets/lib/kiwoomDomesticValuationProvider";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

const PROVIDER_UNAVAILABLE_ERROR = "종목 검색을 준비 중이에요. 잠시 후 다시 시도해주세요.";
const DOMESTIC_ETF_BRAND_QUERIES = new Set(["ACE", "KODEX", "KOSEF", "RISE", "SOL", "TIGER"]);
const KNOWN_DOMESTIC_INSTRUMENTS: DomesticInstrument[] = [
  {
    market: "KR",
    symbol: "005930",
    displayName: "삼성전자",
    instrumentType: "stock",
    currency: "KRW",
    lastClosePrice: 85_000,
    lastCloseDate: "2026-05-29",
  },
  {
    market: "KR",
    symbol: "360750",
    displayName: "TIGER 미국S&P500",
    instrumentType: "etf",
    currency: "KRW",
    lastClosePrice: 21_000,
    lastCloseDate: "2026-05-29",
  },
  {
    market: "KR",
    symbol: "379810",
    displayName: "KODEX 미국나스닥100",
    instrumentType: "etf",
    currency: "KRW",
    lastClosePrice: 18_500,
    lastCloseDate: "2026-05-29",
  },
  {
    market: "KR",
    symbol: "003670",
    displayName: "포스코퓨처엠",
    instrumentType: "stock",
    currency: "KRW",
    lastClosePrice: 250_000,
    lastCloseDate: "2026-05-29",
  },
  {
    market: "KR",
    symbol: "005490",
    displayName: "포스코홀딩스",
    instrumentType: "stock",
    currency: "KRW",
    lastClosePrice: 370_000,
    lastCloseDate: "2026-05-29",
  },
];

export type SearchDomesticInstrumentResult = DomesticInstrument & {
  id: string;
};

export type SearchDomesticInstrumentsState = {
  error?: string;
  instruments?: SearchDomesticInstrumentResult[];
};

type AssetInstrumentRow = {
  id: string;
  market: "KR";
  symbol: string;
  display_name: string;
  instrument_type: DomesticInstrumentType;
  currency: "KRW";
};

function getQuery(formData: FormData) {
  return String(formData.get("query") ?? "").trim();
}

function isLikelyUsListedTicker(query: string) {
  const normalizedQuery = query.trim().toUpperCase();

  if (DOMESTIC_ETF_BRAND_QUERIES.has(normalizedQuery)) {
    return false;
  }

  return /^[A-Z]{1,5}$/.test(normalizedQuery);
}

function toUpsertRow(instrument: DomesticInstrument) {
  return {
    market: instrument.market,
    symbol: instrument.symbol,
    display_name: instrument.displayName,
    instrument_type: instrument.instrumentType,
    currency: instrument.currency,
  };
}

function toResult(
  row: AssetInstrumentRow,
  instrument?: DomesticInstrument,
): SearchDomesticInstrumentResult {
  return {
    id: row.id,
    market: row.market,
    symbol: row.symbol,
    displayName: row.display_name,
    instrumentType: row.instrument_type,
    currency: row.currency,
    lastClosePrice: instrument?.lastClosePrice,
    lastCloseDate: instrument?.lastCloseDate,
  };
}

function toEphemeralResult(instrument: DomesticInstrument): SearchDomesticInstrumentResult {
  return {
    id: `search-${instrument.symbol}`,
    ...instrument,
  };
}

function searchKnownDomesticInstruments(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return KNOWN_DOMESTIC_INSTRUMENTS.filter(
    (instrument) =>
      instrument.displayName.toLowerCase().includes(normalizedQuery) ||
      instrument.symbol.includes(normalizedQuery),
  );
}

function getDefaultDomesticValuationProvider(): DomesticValuationProvider | null {
  const config = createKiwoomConfig(process.env);

  if (!config) {
    return null;
  }

  return createKiwoomDomesticValuationProvider({ config });
}

async function enrichWithLatestClosePrices(
  instruments: DomesticInstrument[],
  provider: DomesticValuationProvider,
) {
  const asOfDate = getTodayInKorea();

  return Promise.all(
    instruments.map(async (instrument) => {
      const closePrice = await provider.getLastClosePrice(instrument.symbol, asOfDate).catch(() => null);

      if (!closePrice) {
        return instrument;
      }

      return {
        ...instrument,
        lastClosePrice: closePrice.closePrice,
        lastCloseDate: closePrice.valuationDate,
      };
    }),
  );
}

async function persistInstrumentResults(instruments: DomesticInstrument[]) {
  const result = await Promise.resolve()
    .then(() => {
      const adminSupabase = createSupabaseAdminClient();
      return adminSupabase
        .from("asset_instruments")
        .upsert(instruments.map(toUpsertRow), { onConflict: "market,symbol" })
        .select("id, market, symbol, display_name, instrument_type, currency");
    })
    .catch(() => null);

  const data = result?.data;
  const error = result?.error;

  if (error || !data) {
    return null;
  }

  const instrumentsBySymbol = new Map(instruments.map((instrument) => [instrument.symbol, instrument]));

  return (data as AssetInstrumentRow[]).map((row) =>
    toResult(row, instrumentsBySymbol.get(row.symbol)),
  );
}

function getTodayInKorea() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function searchDomesticInstrumentsWithProvider(
  _state: SearchDomesticInstrumentsState,
  formData: FormData,
  provider: DomesticValuationProvider | null,
): Promise<SearchDomesticInstrumentsState> {
  const query = getQuery(formData);

  if (!query) {
    return { instruments: [] };
  }

  if (isLikelyUsListedTicker(query)) {
    return { instruments: [] };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!provider) {
    const knownInstruments = searchKnownDomesticInstruments(query);

    if (knownInstruments.length === 0) {
      return { error: PROVIDER_UNAVAILABLE_ERROR };
    }

    if (!user) {
      return { instruments: knownInstruments.map(toEphemeralResult) };
    }

    const persistedInstruments = await persistInstrumentResults(knownInstruments);
    return { instruments: persistedInstruments ?? knownInstruments.map(toEphemeralResult) };
  }

  const searchedInstruments = await provider.searchInstruments(query).catch(() => null);

  if (!searchedInstruments) {
    return { error: "종목 검색이 잠시 지연되고 있어요. 조금 뒤 다시 시도해주세요." };
  }

  const instruments = await enrichWithLatestClosePrices(searchedInstruments, provider);

  if (instruments.length === 0) {
    return { instruments: [] };
  }

  if (!user) {
    return { instruments: instruments.map(toEphemeralResult) };
  }

  const persistedInstruments = await persistInstrumentResults(instruments);

  return {
    instruments: persistedInstruments ?? instruments.map(toEphemeralResult),
  };
}

export async function searchDomesticInstruments(
  state: SearchDomesticInstrumentsState,
  formData: FormData,
): Promise<SearchDomesticInstrumentsState> {
  return searchDomesticInstrumentsWithProvider(
    state,
    formData,
    getDefaultDomesticValuationProvider(),
  );
}
