import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAssetManagementData } from "./getAssetManagementData";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

function createQueryResult<T>(data: T, error: unknown = null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error })),
    then(resolve: (value: { data: T; error: unknown }) => void) {
      return Promise.resolve({ data, error }).then(resolve);
    },
  };
  return builder;
}

describe("getAssetManagementData", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
  });

  it("returns demo mode markers when there is no signed-in user", async () => {
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getAssetManagementData()).resolves.toEqual({
      coupleId: null,
      holdings: undefined,
      liabilities: undefined,
    });
  });

  it("does not read demo holdings from server-visible cookies", async () => {
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getAssetManagementData()).resolves.toEqual({
      coupleId: null,
      holdings: undefined,
      liabilities: undefined,
    });
  });

  it("maps persisted holdings and liabilities for the first couple membership", async () => {
    const holdings = [
      {
        id: "holding-1",
        quantity: 25,
        account_category: "irp",
        asset_instruments: {
          id: "instrument-1",
          symbol: "005930",
          display_name: "삼성전자",
        },
      },
    ];
    const liabilities = [
      {
        id: "liability-1",
        purpose: "investment",
        balance_amount: 15_000_000,
        monthly_interest_amount: 100_000,
        monthly_principal_amount: 300_000,
      },
    ];
    const priceSnapshots = [
      {
        instrument_id: "instrument-1",
        valuation_date: "2026-05-30",
        close_price: 90_000,
      },
    ];
    const membershipQuery = createQueryResult({ couple_id: "couple-1" });
    const holdingsQuery = createQueryResult(holdings);
    const liabilitiesQuery = createQueryResult(liabilities);
    const pricesQuery = createQueryResult(priceSnapshots);
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn((table: string) => {
        if (table === "couple_members") return membershipQuery;
        if (table === "asset_holdings") return holdingsQuery;
        if (table === "asset_liabilities") return liabilitiesQuery;
        if (table === "asset_price_snapshots") return pricesQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getAssetManagementData()).resolves.toEqual({
      coupleId: "couple-1",
      holdings: [
        {
          id: "holding-1",
          symbol: "005930",
          displayName: "삼성전자",
          quantity: 25,
          valuationAmount: 2_250_000,
          valuationDate: "2026-05-30",
          accountCategory: "irp",
        },
      ],
      liabilities: [
        {
          id: "liability-1",
          label: "투자 관련 대출",
          purposeLabel: "투자 관련",
          balanceAmount: 15_000_000,
          monthlyInterestAmount: 100_000,
          monthlyPrincipalAmount: 300_000,
          purpose: "investment",
        },
      ],
    });
  });
});
