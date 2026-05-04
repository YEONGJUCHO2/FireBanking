import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveKnownDomesticHolding } from "./saveKnownDomesticHolding";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

function form(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    coupleId: "couple-1",
    symbol: "005930",
    quantity: "25",
    accountCategory: "general",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

function createSupabaseMock() {
  const membershipSingle = vi.fn(async () => ({ data: { id: "member-1" }, error: null }));
  const instrumentSingle = vi.fn(async () => ({ data: { id: "instrument-1" }, error: null }));
  const holdingsInsert = vi.fn(async () => ({ error: null }));
  const instrumentUpsert = vi.fn(() => ({
    select: vi.fn(() => ({ single: instrumentSingle })),
  }));
  const supabase = {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
    from: vi.fn((table: string) => {
      if (table === "couple_members") {
        const builder = { select: vi.fn(() => builder), eq: vi.fn(() => builder), maybeSingle: membershipSingle };
        return builder;
      }
      if (table === "asset_instruments") return { upsert: instrumentUpsert };
      if (table === "asset_holdings") return { insert: holdingsInsert };
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
  return { supabase, holdingsInsert, instrumentUpsert };
}

describe("saveKnownDomesticHolding", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("returns a validation error for unknown symbols", async () => {
    const result = await saveKnownDomesticHolding({}, form({ symbol: "VOO" }));

    expect(result.error).toBeTruthy();
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("upserts a known domestic instrument and inserts a holding", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await saveKnownDomesticHolding({}, form());

    expect(result).toEqual({ success: true });
    expect(refs.instrumentUpsert).toHaveBeenCalledWith(
      {
        market: "KR",
        symbol: "005930",
        display_name: "삼성전자",
        instrument_type: "stock",
        currency: "KRW",
      },
      { onConflict: "market,symbol" },
    );
    expect(refs.holdingsInsert).toHaveBeenCalledWith({
      couple_id: "couple-1",
      instrument_id: "instrument-1",
      quantity: 25,
      account_category: "general",
      created_by: "user-1",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/assets");
  });
});
