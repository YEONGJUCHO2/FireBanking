import { describe, expect, it } from "vitest";
import { normalizeDomesticInstrument } from "./domesticValuationProvider";

describe("normalizeDomesticInstrument", () => {
  it("normalizes domestic instrument fields", () => {
    expect(
      normalizeDomesticInstrument({
        symbol: "360750",
        displayName: "TIGER 미국S&P500",
        instrumentType: "etf",
      }),
    ).toEqual({
      market: "KR",
      symbol: "360750",
      displayName: "TIGER 미국S&P500",
      instrumentType: "etf",
      currency: "KRW",
    });
  });
});
