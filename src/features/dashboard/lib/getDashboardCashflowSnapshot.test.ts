import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardCashflowSnapshot } from "./getDashboardCashflowSnapshot";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

describe("getDashboardCashflowSnapshot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T03:00:00.000Z"));
    mocks.createSupabaseServerClient.mockReset();
  });

  it("loads the latest current-or-past monthly snapshot instead of falling back to demo dashboard data", async () => {
    const membershipQuery = createQueryResult({ couple_id: "couple-1" });
    const snapshotQuery = createQueryResult({
      total_income: 7_200_000,
      investable_net_worth: 50_000_000,
      primary_residence_net_worth: 0,
      other_net_worth: 0,
      total_net_worth_for_display: 50_000_000,
      fire_calculation_net_worth: 50_000_000,
      fixed_expense: 2_300_000,
      variable_expense: 2_000_000,
      regular_investment: 0,
      monthly_asset_growth_capacity: 1_700_000,
      annual_fire_expense: 51_600_000,
      fire_target_asset: 1_290_000_000,
    });
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
      },
      from: vi.fn((table: string) => {
        if (table === "couple_members") return membershipQuery;
        if (table === "monthly_cashflow_snapshots") return snapshotQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    const snapshot = await getDashboardCashflowSnapshot();

    expect(snapshot?.annual_fire_expense).toBe(51_600_000);
    expect(snapshot?.fire_target_asset).toBe(1_290_000_000);
    expect(snapshot?.fire_calculation_net_worth).toBe(50_000_000);
    expect(snapshot?.monthly_asset_growth_capacity).toBe(1_700_000);
    expect(snapshotQuery.lte).toHaveBeenCalledWith("month", "2026-05-01");
    expect(snapshotQuery.order).toHaveBeenCalledWith("month", { ascending: false });
    expect(snapshotQuery.limit).toHaveBeenCalledWith(1);
  });
});

function createQueryResult<T>(data: T, error: unknown = null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error })),
  };
  return builder;
}
