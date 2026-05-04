import type { DomesticValuationProvider } from "@/src/features/assets/lib/domesticValuationProvider";
import {
  createKiwoomConfig,
  createKiwoomDomesticValuationProvider,
} from "@/src/features/assets/lib/kiwoomDomesticValuationProvider";
import {
  syncDailyDomesticPrices,
  type SyncDailyDomesticPricesSupabase,
} from "@/src/features/assets/jobs/syncDailyDomesticPrices";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

function currentDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function createNonLiveDomesticProvider(): DomesticValuationProvider {
  return {
    searchInstruments: async () => [],
    getLastClosePrice: async () => null,
  };
}

function createDomesticProvider() {
  const kiwoomConfig = createKiwoomConfig(process.env);

  if (!kiwoomConfig) {
    return createNonLiveDomesticProvider();
  }

  return createKiwoomDomesticValuationProvider({ config: kiwoomConfig });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await syncDailyDomesticPrices({
    supabase: createSupabaseAdminClient() as unknown as SyncDailyDomesticPricesSupabase,
    provider: createDomesticProvider(),
    asOfDate: currentDateKey(),
  });

  return Response.json(result);
}
