import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  createMonthEndSnapshots: vi.fn(),
  syncDailyDomesticPrices: vi.fn(),
}));

vi.mock("@/src/lib/supabase/admin", () => ({
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

vi.mock("@/src/features/assets/jobs/createMonthEndSnapshots", () => ({
  createMonthEndSnapshots: mocks.createMonthEndSnapshots,
}));

vi.mock("@/src/features/assets/jobs/syncDailyDomesticPrices", () => ({
  syncDailyDomesticPrices: mocks.syncDailyDomesticPrices,
}));

async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

describe("create month-end snapshots cron route", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "secret-1");
    mocks.createSupabaseAdminClient.mockReset();
    mocks.createMonthEndSnapshots.mockReset();
    mocks.syncDailyDomesticPrices.mockReset();
  });

  it("rejects missing or invalid CRON_SECRET", async () => {
    const { GET } = await loadRoute();

    const response = await GET(new Request("http://localhost/api/cron/create-month-end-snapshots"));

    expect(response.status).toBe(401);
    expect(mocks.createMonthEndSnapshots).not.toHaveBeenCalled();
  });

  it("exits without creating snapshots when today is not the KST month-end date", async () => {
    const { GET } = await loadRoute();

    const response = await GET(
      new Request("http://localhost/api/cron/create-month-end-snapshots?now=2026-05-30T12:00:00.000Z", {
        headers: { Authorization: "Bearer secret-1" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ skipped: true, reason: "not_month_end", snapshotDate: "2026-05-30" });
    expect(mocks.createMonthEndSnapshots).not.toHaveBeenCalled();
  });

  it("calls the underlying jobs and returns JSON counts when CRON_SECRET is valid", async () => {
    const { GET } = await loadRoute();
    mocks.createSupabaseAdminClient.mockReturnValue({ from: vi.fn() });
    mocks.syncDailyDomesticPrices.mockResolvedValue({ synced: 2, skipped: 0, failed: 0 });
    mocks.createMonthEndSnapshots.mockResolvedValue({
      created: 1,
      updated: 0,
      warnings: ["one warning"],
    });

    const response = await GET(
      new Request("http://localhost/api/cron/create-month-end-snapshots?now=2026-05-31T14:30:00.000Z", {
        headers: { Authorization: "Bearer secret-1" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.syncDailyDomesticPrices).toHaveBeenCalledOnce();
    expect(mocks.createMonthEndSnapshots).toHaveBeenCalledOnce();
    expect(body).toEqual({
      snapshotDate: "2026-05-31",
      priceSync: { synced: 2, skipped: 0, failed: 0 },
      snapshots: { created: 1, updated: 0, warnings: ["one warning"] },
    });
  });
});
