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
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

const PROVIDER_UNAVAILABLE_ERROR = "종목 검색을 준비 중이에요. 잠시 후 다시 시도해주세요.";
const DOMESTIC_ETF_BRAND_QUERIES = new Set(["ACE", "KODEX", "KOSEF", "RISE", "SOL", "TIGER"]);

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
    return { error: PROVIDER_UNAVAILABLE_ERROR };
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

  const { data, error } = await supabase
    .from("asset_instruments")
    .upsert(instruments.map(toUpsertRow), { onConflict: "market,symbol" })
    .select("id, market, symbol, display_name, instrument_type, currency");

  if (error || !data) {
    return { error: "종목 검색 결과를 저장하지 못했습니다." };
  }

  const instrumentsBySymbol = new Map(instruments.map((instrument) => [instrument.symbol, instrument]));

  return {
    instruments: (data as AssetInstrumentRow[]).map((row) =>
      toResult(row, instrumentsBySymbol.get(row.symbol)),
    ),
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
