"use server";

import type {
  DomesticInstrument,
  DomesticInstrumentType,
  DomesticValuationProvider,
} from "@/src/features/assets/lib/domesticValuationProvider";
import { createKiwoomConfig } from "@/src/features/assets/lib/kiwoomDomesticValuationProvider";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

const PROVIDER_UNAVAILABLE_ERROR = "종목 검색을 준비 중이에요. 잠시 후 다시 시도해주세요.";

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
  return /^[A-Z]{1,5}$/.test(query);
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

function toResult(row: AssetInstrumentRow): SearchDomesticInstrumentResult {
  return {
    id: row.id,
    market: row.market,
    symbol: row.symbol,
    displayName: row.display_name,
    instrumentType: row.instrument_type,
    currency: row.currency,
  };
}

function getDefaultDomesticValuationProvider(): DomesticValuationProvider | null {
  const config = createKiwoomConfig(process.env);

  if (!config) {
    return null;
  }

  return null;
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

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  if (!provider) {
    return { error: PROVIDER_UNAVAILABLE_ERROR };
  }

  const instruments = await provider.searchInstruments(query);

  if (instruments.length === 0) {
    return { instruments: [] };
  }

  const { data, error } = await supabase
    .from("asset_instruments")
    .upsert(instruments.map(toUpsertRow), { onConflict: "market,symbol" })
    .select("id, market, symbol, display_name, instrument_type, currency");

  if (error || !data) {
    return { error: "종목 검색 결과를 저장하지 못했습니다." };
  }

  return { instruments: (data as AssetInstrumentRow[]).map(toResult) };
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
