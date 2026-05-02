import type {
  DomesticClosePrice,
  DomesticInstrument,
  DomesticInstrumentType,
  DomesticValuationProvider,
} from "./domesticValuationProvider";
import { normalizeDomesticInstrument } from "./domesticValuationProvider";

export type KiwoomConfig = {
  appKey: string;
  appSecret: string;
  baseUrl: string;
};

type KiwoomEnv = Record<string, string | undefined> & {
  KIWOOM_APP_KEY?: string;
  KIWOOM_APP_SECRET?: string;
  KIWOOM_BASE_URL?: string;
};

type KiwoomFetch = typeof fetch;

type KiwoomTokenResponse = {
  token?: string;
  token_type?: string;
};

type KiwoomInstrumentRow = {
  code?: string;
  name?: string;
  marketName?: string;
  lastPrice?: string;
};

type KiwoomDailyPriceRow = {
  date?: string;
  close_pric?: string;
  dt?: string;
  cur_prc?: string;
};

const KOREA_STOCK_MARKETS = [
  { code: "0", instrumentType: "stock" },
  { code: "10", instrumentType: "stock" },
  { code: "8", instrumentType: "etf" },
] satisfies Array<{ code: string; instrumentType: DomesticInstrumentType }>;

export function createKiwoomConfig(env: KiwoomEnv): KiwoomConfig | null {
  if (!env.KIWOOM_APP_KEY || !env.KIWOOM_APP_SECRET) {
    return null;
  }

  return {
    appKey: env.KIWOOM_APP_KEY,
    appSecret: env.KIWOOM_APP_SECRET,
    baseUrl: env.KIWOOM_BASE_URL ?? "https://api.kiwoom.com",
  };
}

export function createKiwoomDomesticValuationProvider({
  config,
  fetcher = fetch,
  now = () => new Date(),
}: {
  config: KiwoomConfig;
  fetcher?: KiwoomFetch;
  now?: () => Date;
}): DomesticValuationProvider {
  let cachedToken: string | null = null;

  const requestToken = async () => {
    if (cachedToken) {
      return cachedToken;
    }

    const response = await fetcher(`${trimTrailingSlash(config.baseUrl)}/oauth2/token`, {
      method: "POST",
      headers: { "content-type": "application/json;charset=UTF-8" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: config.appKey,
        secretkey: config.appSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kiwoom token request failed: ${response.status}`);
    }

    const body = (await response.json()) as KiwoomTokenResponse;
    if (!body.token) {
      throw new Error("Kiwoom token response did not include token");
    }

    cachedToken = body.token;
    return cachedToken;
  };

  const requestDomesticStock = async <TBody extends Record<string, string>>(
    apiId: string,
    body: TBody,
  ) => {
    return requestDomesticApi("/api/dostk/stkinfo", apiId, body);
  };

  const requestDomesticChart = async <TBody extends Record<string, string>>(
    apiId: string,
    body: TBody,
  ) => {
    return requestDomesticApi("/api/dostk/chart", apiId, body);
  };

  const requestDomesticApi = async <TBody extends Record<string, string>>(
    path: string,
    apiId: string,
    body: TBody,
  ) => {
    const token = await requestToken();
    const response = await fetcher(`${trimTrailingSlash(config.baseUrl)}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        authorization: `Bearer ${token}`,
        "api-id": apiId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Kiwoom ${apiId} request failed: ${response.status}`);
    }

    return response.json() as Promise<unknown>;
  };

  return {
    async searchInstruments(query: string): Promise<DomesticInstrument[]> {
      const normalizedQuery = normalizeSearchText(query);
      if (!normalizedQuery) {
        return [];
      }

      const results: DomesticInstrument[] = [];

      for (const market of KOREA_STOCK_MARKETS) {
        const body = (await requestDomesticStock("ka10099", {
          mrkt_tp: market.code,
        })) as { list?: KiwoomInstrumentRow[] };

        (body.list ?? []).forEach((row) => {
          const symbol = normalizeSymbol(row.code);
          const displayName = row.name?.trim();

          if (!symbol || !displayName) {
            return;
          }

          const matches =
            symbol.includes(normalizedQuery) ||
            normalizeSearchText(displayName).includes(normalizedQuery);

          const instrumentType = inferInstrumentType(row, market.instrumentType);
          const existingIndex = results.findIndex((instrument) => instrument.symbol === symbol);

          if (!matches) {
            return;
          }

          const instrument = normalizeDomesticInstrument({
            symbol,
            displayName,
            instrumentType,
            lastClosePrice: parseOptionalKiwoomNumber(row.lastPrice),
          });

          if (existingIndex >= 0) {
            results[existingIndex] = preferEtfInstrument(results[existingIndex], instrument);
            return;
          }

          results.push(instrument);
        });
      }

      return results.sort((left, right) => {
        const leftRank = rankInstrumentSearchResult(left, normalizedQuery);
        const rightRank = rankInstrumentSearchResult(right, normalizedQuery);

        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }

        return left.displayName.localeCompare(right.displayName, "ko-KR");
      });
    },

    async getLastClosePrice(symbol: string, asOfDate: string): Promise<DomesticClosePrice | null> {
      const body = (await requestDomesticChart("ka10081", {
        stk_cd: normalizeSymbol(symbol),
        base_dt: compactDate(asOfDate),
        upd_stkpc_tp: "1",
      })) as { stk_dt_pole_chart_qry?: KiwoomDailyPriceRow[] };
      const row = (body.stk_dt_pole_chart_qry ?? []).find((candidate) => {
        const date = parseKiwoomDate(candidate.dt ?? candidate.date);
        return Boolean(date && Number.isFinite(parseKiwoomNumber(candidate.cur_prc ?? candidate.close_pric)));
      });

      if (!row) {
        return null;
      }

      const valuationDate = parseKiwoomDate(row.dt ?? row.date);
      const closePrice = parseKiwoomNumber(row.cur_prc ?? row.close_pric);

      if (!valuationDate || !Number.isFinite(closePrice)) {
        return null;
      }

      return {
        symbol: normalizeSymbol(symbol),
        valuationDate,
        closePrice,
        provider: "kiwoom",
        fetchedAt: now().toISOString(),
      };
    },
  };
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeSymbol(value: string | undefined) {
  return String(value ?? "")
    .replace(/_(NX|AL)$/i, "")
    .replace(/[^0-9A-Za-z]/g, "")
    .trim();
}

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase().replaceAll("posco", "포스코");
}

function inferInstrumentType(
  row: KiwoomInstrumentRow,
  fallback: DomesticInstrumentType,
): DomesticInstrumentType {
  return row.marketName?.toLowerCase().includes("etf") ? "etf" : fallback;
}

function rankInstrumentSearchResult(instrument: DomesticInstrument, normalizedQuery: string) {
  const normalizedName = normalizeSearchText(instrument.displayName);

  if (instrument.symbol === normalizedQuery || normalizedName === normalizedQuery) {
    return 0;
  }

  if (instrument.symbol.startsWith(normalizedQuery) || normalizedName.startsWith(normalizedQuery)) {
    return 1;
  }

  return 2 + getDerivativeVariantPenalty(normalizedName);
}

function getDerivativeVariantPenalty(normalizedName: string) {
  return ["선물", "레버리지", "인버스", "합성"].some((keyword) => normalizedName.includes(keyword))
    ? 2
    : 0;
}

function preferEtfInstrument(
  current: DomesticInstrument,
  candidate: DomesticInstrument,
): DomesticInstrument {
  return current.instrumentType === "etf" ? current : candidate;
}

function compactDate(value: string) {
  return value.replaceAll("-", "").slice(0, 8);
}

function parseKiwoomDate(value: string | undefined) {
  const compact = compactDate(String(value ?? ""));

  if (!/^\d{8}$/.test(compact)) {
    return null;
  }

  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function parseKiwoomNumber(value: string | undefined) {
  return Math.abs(Number(String(value ?? "").replaceAll(",", "").trim()));
}

function parseOptionalKiwoomNumber(value: string | undefined) {
  const parsed = parseKiwoomNumber(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
