import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateHolding } from "./updateHolding";

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
    holdingId: "holding-1",
    quantity: "4",
    accountCategory: "irp",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

function createSupabaseMock({ isAdmin = true } = {}) {
  const membershipSingle = vi.fn(async () => ({
    data: isAdmin ? { id: "member-1" } : null,
    error: null,
  }));
  const eqCalls: Array<[string, string]> = [];
  const updateEq = vi.fn((key: string, value: string) => {
    eqCalls.push([key, value]);
    return updateBuilder;
  });
  const updateBuilder = {
    update: vi.fn(() => updateBuilder),
    eq: updateEq,
    then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
  };
  const supabase = {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
    from: vi.fn((table: string) => {
      if (table === "couple_members") {
        const builder = { select: vi.fn(() => builder), eq: vi.fn(() => builder), maybeSingle: membershipSingle };
        return builder;
      }
      if (table === "asset_holdings") return updateBuilder;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
  return { supabase, updateBuilder, eqCalls };
}

describe("updateHolding", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("updates holding quantity for an admin couple member", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await updateHolding({}, form());

    expect(result).toEqual({ success: true });
    expect(refs.updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 4, account_category: "irp" }),
    );
    expect(refs.eqCalls).toContainEqual(["id", "holding-1"]);
    expect(refs.eqCalls).toContainEqual(["couple_id", "couple-1"]);
  });

  it("rejects updates from non-admin members", async () => {
    const refs = createSupabaseMock({ isAdmin: false });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await updateHolding({}, form());

    expect(result).toEqual({ error: "관리자 계정만 자산과 부채를 수정할 수 있습니다." });
    expect(refs.updateBuilder.update).not.toHaveBeenCalled();
  });
});
