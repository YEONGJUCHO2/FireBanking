import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  syncDailyDomesticPrices: vi.fn(),
}));

vi.mock("@/src/lib/supabase/admin", () => ({
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

vi.mock("@/src/features/assets/jobs/syncDailyDomesticPrices", () => ({
  syncDailyDomesticPrices: mocks.syncDailyDomesticPrices,
}));

async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

describe("sync daily domestic prices cron route", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "secret-1");
    mocks.createSupabaseAdminClient.mockReset();
    mocks.syncDailyDomesticPrices.mockReset();
  });

  it("rejects missing or invalid CRON_SECRET", async () => {
    const { GET } = await loadRoute();

    const response = await GET(new Request("http://localhost/api/cron/sync-daily-domestic-prices"));

    expect(response.status).toBe(401);
    expect(mocks.syncDailyDomesticPrices).not.toHaveBeenCalled();
  });

  it("calls the underlying job when CRON_SECRET is valid", async () => {
    const { GET } = await loadRoute();
    mocks.createSupabaseAdminClient.mockReturnValue({ from: vi.fn() });
    mocks.syncDailyDomesticPrices.mockResolvedValue({ synced: 1, skipped: 2, failed: 0 });

    const response = await GET(
      new Request("http://localhost/api/cron/sync-daily-domestic-prices", {
        headers: { Authorization: "Bearer secret-1" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.syncDailyDomesticPrices).toHaveBeenCalledOnce();
    expect(body).toEqual({ synced: 1, skipped: 2, failed: 0 });
  });
});
