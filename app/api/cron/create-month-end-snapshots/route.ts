import type { DomesticValuationProvider } from "@/src/features/assets/lib/domesticValuationProvider";
import { getKstMonthEndDate } from "@/src/features/assets/lib/monthEndSnapshot";
import {
  createMonthEndSnapshots,
  type CreateMonthEndSnapshotsSupabase,
} from "@/src/features/assets/jobs/createMonthEndSnapshots";
import {
  syncDailyDomesticPrices,
  type SyncDailyDomesticPricesSupabase,
} from "@/src/features/assets/jobs/syncDailyDomesticPrices";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

function getKstDateKey(date: Date) {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function createNonLiveDomesticProvider(): DomesticValuationProvider {
  return {
    searchInstruments: async () => [],
    getLastClosePrice: async () => null,
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const now = new Date(url.searchParams.get("now") ?? Date.now());
  const snapshotDate = getKstDateKey(now);

  if (snapshotDate !== getKstMonthEndDate(now)) {
    return Response.json({ skipped: true, reason: "not_month_end", snapshotDate });
  }

  const supabase = createSupabaseAdminClient();
  const provider = createNonLiveDomesticProvider();
  const priceSync = await syncDailyDomesticPrices({
    supabase: supabase as unknown as SyncDailyDomesticPricesSupabase,
    provider,
    asOfDate: snapshotDate,
  });
  const snapshots = await createMonthEndSnapshots({
    supabase: supabase as unknown as CreateMonthEndSnapshotsSupabase,
    snapshotDate,
  });

  return Response.json({ snapshotDate, priceSync, snapshots });
}
