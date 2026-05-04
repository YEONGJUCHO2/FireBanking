import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  createKiwoomConfig: vi.fn(),
  createKiwoomDomesticValuationProvider: vi.fn(),
  syncDailyDomesticPrices: vi.fn(),
}));

vi.mock("@/src/lib/supabase/admin", () => ({
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

vi.mock("@/src/features/assets/jobs/syncDailyDomesticPrices", () => ({
  syncDailyDomesticPrices: mocks.syncDailyDomesticPrices,
}));

vi.mock("@/src/features/assets/lib/kiwoomDomesticValuationProvider", () => ({
  createKiwoomConfig: mocks.createKiwoomConfig,
  createKiwoomDomesticValuationProvider: mocks.createKiwoomDomesticValuationProvider,
}));

async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

describe("sync daily domestic prices cron route", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "secret-1");
    mocks.createSupabaseAdminClient.mockReset();
    mocks.createKiwoomConfig.mockReset();
    mocks.createKiwoomDomesticValuationProvider.mockReset();
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

  it("uses the Kiwoom provider when Kiwoom credentials are configured", async () => {
    const provider = { searchInstruments: vi.fn(), getLastClosePrice: vi.fn() };
    const { GET } = await loadRoute();
    mocks.createSupabaseAdminClient.mockReturnValue({ from: vi.fn() });
    mocks.createKiwoomConfig.mockReturnValue({
      appKey: "app-key",
      appSecret: "app-secret",
      baseUrl: "https://api.kiwoom.com",
    });
    mocks.createKiwoomDomesticValuationProvider.mockReturnValue(provider);
    mocks.syncDailyDomesticPrices.mockResolvedValue({ synced: 1, skipped: 0, failed: 0 });

    await GET(
      new Request("http://localhost/api/cron/sync-daily-domestic-prices", {
        headers: { Authorization: "Bearer secret-1" },
      }),
    );

    expect(mocks.createKiwoomConfig).toHaveBeenCalledWith(process.env);
    expect(mocks.createKiwoomDomesticValuationProvider).toHaveBeenCalledWith({
      config: {
        appKey: "app-key",
        appSecret: "app-secret",
        baseUrl: "https://api.kiwoom.com",
      },
    });
    expect(mocks.syncDailyDomesticPrices).toHaveBeenCalledWith(
      expect.objectContaining({ provider }),
    );
  });
});
