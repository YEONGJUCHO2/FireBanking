import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveHolding } from "./saveHolding";

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
    instrumentId: "instrument-1",
    quantity: "3.5",
    accountCategory: "general",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

function createSupabaseMock() {
  const membershipSingle = vi.fn(async () => ({ data: { id: "member-1" }, error: null }));
  const instrumentSingle = vi.fn(async () => ({ data: { id: "instrument-1" }, error: null }));
  const insert = vi.fn(async () => ({ error: null }));
  const supabase = {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
    from: vi.fn((table: string) => {
      if (table === "couple_members") {
        const builder = { select: vi.fn(() => builder), eq: vi.fn(() => builder), maybeSingle: membershipSingle };
        return builder;
      }
      if (table === "asset_instruments") {
        const builder = { select: vi.fn(() => builder), eq: vi.fn(() => builder), maybeSingle: instrumentSingle };
        return builder;
      }
      if (table === "asset_holdings") return { insert };
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
  return { supabase, insert, membershipSingle, instrumentSingle };
}

describe("saveHolding", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("returns a validation error when quantity is missing", async () => {
    const result = await saveHolding({}, form({ quantity: "" }));

    expect(result).toEqual({ error: "보유 수량을 입력해주세요." });
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("inserts a selected domestic holding for an admin couple member", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await saveHolding({}, form());

    expect(result).toEqual({ success: true });
    expect(refs.insert).toHaveBeenCalledWith({
      couple_id: "couple-1",
      instrument_id: "instrument-1",
      quantity: 3.5,
      account_category: "general",
      created_by: "user-1",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
