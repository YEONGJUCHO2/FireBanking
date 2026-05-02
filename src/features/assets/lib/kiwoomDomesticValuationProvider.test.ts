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
            { code: "005930", name: "삼성전자" },
            { code: "005490", name: "포스코홀딩스" },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          list: [{ code: "003670", name: "포스코퓨처엠" }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          list: [{ code: "360750", name: "TIGER 미국S&P500" }],
        }),
      );
    const provider = createKiwoomDomesticValuationProvider({
      config: { appKey: "app-key", appSecret: "app-secret", baseUrl: "https://api.example.com" },
      fetcher,
    });

    await expect(provider.searchInstruments("포스코")).resolves.toEqual([
      {
        market: "KR",
        symbol: "005490",
        displayName: "포스코홀딩스",
        instrumentType: "stock",
        currency: "KRW",
      },
      {
        market: "KR",
        symbol: "003670",
        displayName: "포스코퓨처엠",
        instrumentType: "stock",
        currency: "KRW",
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

  it("returns the latest daily close price from Kiwoom daily price API", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ token: "access-token", token_type: "bearer" }))
      .mockResolvedValueOnce(
        jsonResponse({
          daly_stkpc: [
            { date: "20260529", close_pric: "+85300" },
            { date: "20260528", close_pric: "84000" },
          ],
        }),
      );
    const provider = createKiwoomDomesticValuationProvider({
      config: { appKey: "app-key", appSecret: "app-secret", baseUrl: "https://api.example.com" },
      fetcher,
      now: () => new Date("2026-05-30T00:00:00.000Z"),
    });

    await expect(provider.getLastClosePrice("005930", "2026-05-30")).resolves.toEqual({
      symbol: "005930",
      valuationDate: "2026-05-29",
      closePrice: 85_300,
      provider: "kiwoom",
      fetchedAt: "2026-05-30T00:00:00.000Z",
    });
    expect(fetcher).toHaveBeenLastCalledWith(
      "https://api.example.com/api/dostk/stkinfo",
      expect.objectContaining({
        headers: expect.objectContaining({ "api-id": "ka10086" }),
        body: JSON.stringify({ stk_cd: "005930", qry_dt: "20260530", indc_tp: "0" }),
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
