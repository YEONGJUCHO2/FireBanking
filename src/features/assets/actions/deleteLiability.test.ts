import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteLiability } from "./deleteLiability";

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
  return formData;
}

function createSupabaseMock({ isAdmin = true } = {}) {
  const membershipSingle = vi.fn(async () => ({ data: isAdmin ? { id: "member-1" } : null, error: null }));
  const eqCalls: Array<[string, string]> = [];
  const deleteBuilder = {
    delete: vi.fn(() => deleteBuilder),
    eq: vi.fn((key: string, value: string) => {
      eqCalls.push([key, value]);
      return deleteBuilder;
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
      if (table === "asset_liabilities") return deleteBuilder;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
  return { supabase, deleteBuilder, eqCalls };
}

describe("deleteLiability", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("deletes a liability for an admin couple member", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await deleteLiability({}, form());

    expect(result).toEqual({ success: true });
    expect(refs.deleteBuilder.delete).toHaveBeenCalledOnce();
    expect(refs.eqCalls).toContainEqual(["id", "liability-1"]);
    expect(refs.eqCalls).toContainEqual(["couple_id", "couple-1"]);
  });

  it("rejects deletes from non-admin members", async () => {
    const refs = createSupabaseMock({ isAdmin: false });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await deleteLiability({}, form());

    expect(result).toEqual({ error: "리드 파트너 계정만 자산과 부채를 수정할 수 있습니다." });
    expect(refs.deleteBuilder.delete).not.toHaveBeenCalled();
  });
});
