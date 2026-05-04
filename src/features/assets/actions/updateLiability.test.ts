import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateLiability } from "./updateLiability";

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

function form() {
  const formData = new FormData();
  formData.set("coupleId", "couple-1");
  formData.set("liabilityId", "liability-1");
  formData.set("purpose", "lifestyle_credit");
  formData.set("balanceAmount", "500");
  formData.set("monthlyInterestAmount", "5");
  formData.set("monthlyPrincipalAmount", "20");
  return formData;
}

function createSupabaseMock({ isAdmin = true } = {}) {
  const membershipSingle = vi.fn(async () => ({ data: isAdmin ? { id: "member-1" } : null, error: null }));
  const eqCalls: Array<[string, string]> = [];
  const updateBuilder = {
    update: vi.fn(() => updateBuilder),
    eq: vi.fn((key: string, value: string) => {
      eqCalls.push([key, value]);
      return updateBuilder;
    }),
    then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
  };
  const supabase = {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
    from: vi.fn((table: string) => {
      if (table === "couple_members") {
        const builder = { select: vi.fn(() => builder), eq: vi.fn(() => builder), maybeSingle: membershipSingle };
        return builder;
      }
      if (table === "asset_liabilities") return updateBuilder;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
  return { supabase, updateBuilder, eqCalls };
}

describe("updateLiability", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("updates liability balance, monthly interest, and monthly principal", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await updateLiability({}, form());

    expect(result).toEqual({ success: true });
    expect(refs.updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: "lifestyle_credit",
        balance_amount: 5_000_000,
        monthly_interest_amount: 50_000,
        monthly_principal_amount: 200_000,
      }),
    );
    expect(refs.eqCalls).toContainEqual(["id", "liability-1"]);
    expect(refs.eqCalls).toContainEqual(["couple_id", "couple-1"]);
  });

  it("rejects updates from non-admin members", async () => {
    const refs = createSupabaseMock({ isAdmin: false });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await updateLiability({}, form());

    expect(result).toEqual({ error: "리드 파트너 계정만 자산과 부채를 수정할 수 있습니다." });
    expect(refs.updateBuilder.update).not.toHaveBeenCalled();
  });
});
