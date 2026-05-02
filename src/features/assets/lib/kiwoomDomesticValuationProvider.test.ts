import { describe, expect, it, vi } from "vitest";
import {
  createKiwoomConfig,
  createKiwoomDomesticValuationProvider,
} from "./kiwoomDomesticValuationProvider";

describe("createKiwoomConfig", () => {
  it("returns config when required credentials exist", () => {
    expect(
      createKiwoomConfig({
        KIWOOM_APP_KEY: "app-key",
        KIWOOM_APP_SECRET: "app-secret",
      }),
    ).toEqual({
      appKey: "app-key",
      appSecret: "app-secret",
      baseUrl: "https://api.kiwoom.com",
    });
  });

  it("returns null when credentials are missing", () => {
    expect(createKiwoomConfig({})).toBeNull();
  });
});

describe("createKiwoomDomesticValuationProvider", () => {
  it("searches stock and ETF instruments through Kiwoom master list APIs", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ token: "access-token", token_type: "bearer" }))
      .mockResolvedValueOnce(
        jsonResponse({
          list: [
            { code: "005930", name: "삼성전자", lastPrice: "00085300" },
            { code: "005490", name: "POSCO홀딩스", lastPrice: "00469000" },
            { code: "469170", name: "ACE 포스코그룹포커스", marketName: "ETF", lastPrice: "00008730" },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          list: [{ code: "003670", name: "포스코퓨처엠", lastPrice: "00261000" }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          list: [
            { code: "360750", name: "TIGER 미국S&P500", lastPrice: "00021000" },
            { code: "469170", name: "ACE 포스코그룹포커스", marketName: "ETF", lastPrice: "00008730" },
          ],
        }),
      );
    const provider = createKiwoomDomesticValuationProvider({
      config: { appKey: "app-key", appSecret: "app-secret", baseUrl: "https://api.example.com" },
      fetcher,
    });

    await expect(provider.searchInstruments("포스코")).resolves.toEqual([
      {
        market: "KR",
        symbol: "003670",
        displayName: "포스코퓨처엠",
        instrumentType: "stock",
        currency: "KRW",
        lastClosePrice: 261_000,
      },
      {
        market: "KR",
        symbol: "005490",
        displayName: "POSCO홀딩스",
        instrumentType: "stock",
        currency: "KRW",
        lastClosePrice: 469_000,
      },
      {
        market: "KR",
        symbol: "469170",
        displayName: "ACE 포스코그룹포커스",
        instrumentType: "etf",
        currency: "KRW",
        lastClosePrice: 8_730,
      },
    ]);
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/oauth2/token",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          grant_type: "client_credentials",
          appkey: "app-key",
          secretkey: "app-secret",
        }),
      }),
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/api/dostk/stkinfo",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer access-token",
          "api-id": "ka10099",
        }),
        body: JSON.stringify({ mrkt_tp: "0" }),
      }),
    );
  });

  it("ranks exact domestic ETF name matches before derivative variants", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ token: "access-token", token_type: "bearer" }))
      .mockResolvedValueOnce(jsonResponse({ list: [] }))
      .mockResolvedValueOnce(jsonResponse({ list: [] }))
      .mockResolvedValueOnce(
        jsonResponse({
          list: [
            { code: "143850", name: "TIGER 미국S&P500선물(H)", marketName: "ETF", lastPrice: "00072835" },
            { code: "225040", name: "TIGER 미국S&P500레버리지(합성 H)", marketName: "ETF", lastPrice: "00059820" },
            { code: "360750", name: "TIGER 미국S&P500", marketName: "ETF", lastPrice: "00021000" },
          ],
        }),
      );
    const provider = createKiwoomDomesticValuationProvider({
      config: { appKey: "app-key", appSecret: "app-secret", baseUrl: "https://api.example.com" },
      fetcher,
    });

    const results = await provider.searchInstruments("TIGER 미국S&P500");

    expect(results[0]).toEqual({
      market: "KR",
      symbol: "360750",
      displayName: "TIGER 미국S&P500",
      instrumentType: "etf",
      currency: "KRW",
      lastClosePrice: 21_000,
    });
  });

  it("returns the latest daily close price from Kiwoom daily price API", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ token: "access-token", token_type: "bearer" }))
      .mockResolvedValueOnce(
        jsonResponse({
          stk_dt_pole_chart_qry: [
            { dt: "20260430", cur_prc: "252000" },
            { dt: "20260429", cur_prc: "261000" },
          ],
        }),
      );
    const provider = createKiwoomDomesticValuationProvider({
      config: { appKey: "app-key", appSecret: "app-secret", baseUrl: "https://api.example.com" },
      fetcher,
      now: () => new Date("2026-05-02T00:00:00.000Z"),
    });

    await expect(provider.getLastClosePrice("003670", "2026-05-02")).resolves.toEqual({
      symbol: "003670",
      valuationDate: "2026-04-30",
      closePrice: 252_000,
      provider: "kiwoom",
      fetchedAt: "2026-05-02T00:00:00.000Z",
    });
    expect(fetcher).toHaveBeenLastCalledWith(
      "https://api.example.com/api/dostk/chart",
      expect.objectContaining({
        headers: expect.objectContaining({ "api-id": "ka10081" }),
        body: JSON.stringify({ stk_cd: "003670", base_dt: "20260502", upd_stkpc_tp: "1" }),
      }),
    );
  });
});

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: vi.fn(async () => body),
    headers: {
      get: vi.fn(() => null),
    },
  };
}
