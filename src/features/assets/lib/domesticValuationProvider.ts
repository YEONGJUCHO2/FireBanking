export type DomesticInstrumentType = "stock" | "etf";

export type DomesticInstrument = {
  market: "KR";
  symbol: string;
  displayName: string;
  instrumentType: DomesticInstrumentType;
  currency: "KRW";
  lastClosePrice?: number;
  lastCloseDate?: string;
};

export type DomesticClosePrice = {
  symbol: string;
  valuationDate: string;
  closePrice: number;
  provider: string;
  fetchedAt: string;
};

export type DomesticValuationProvider = {
  searchInstruments(query: string): Promise<DomesticInstrument[]>;
  getLastClosePrice(symbol: string, asOfDate: string): Promise<DomesticClosePrice | null>;
};

export function normalizeDomesticInstrument(input: {
  symbol: string;
  displayName: string;
  instrumentType: DomesticInstrumentType;
  lastClosePrice?: number;
  lastCloseDate?: string;
}): DomesticInstrument {
  return {
    market: "KR",
    symbol: input.symbol,
    displayName: input.displayName,
    instrumentType: input.instrumentType,
    currency: "KRW",
    lastClosePrice: input.lastClosePrice,
    lastCloseDate: input.lastCloseDate,
  };
}
