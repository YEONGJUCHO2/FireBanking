export type DomesticInstrumentType = "stock" | "etf";

export type DomesticInstrument = {
  market: "KR";
  symbol: string;
  displayName: string;
  instrumentType: DomesticInstrumentType;
  currency: "KRW";
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
}): DomesticInstrument {
  return {
    market: "KR",
    symbol: input.symbol,
    displayName: input.displayName,
    instrumentType: input.instrumentType,
    currency: "KRW",
  };
}
