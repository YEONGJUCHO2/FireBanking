import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveLiteCheckin } from "./saveLiteCheckin";

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
    token: "invite-token",
    incomeMan: "350",
    expenseMan: "180",
    savingsMan: "80",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

function membershipBuilder(data: { couple_id: string } | null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
  };
  return builder;
}

function createSupabaseMock({
  user = {
    id: "lite-1",
    email: "partner@example.com",
    user_metadata: { full_name: "Partner" },
  },
  acceptResult = "accepted",
  checkinError = null,
}: {
  user?: { id: string; email?: string; user_metadata: { full_name?: string } } | null;
  acceptResult?: string;
  checkinError?: unknown;
} = {}) {
  const profileUpsert = vi.fn(async () => ({ error: null }));
  const rpc = vi.fn(async () => ({ data: acceptResult, error: null }));
  const checkinUpsert = vi.fn(async () => ({ error: checkinError }));
  const membership = membershipBuilder({ couple_id: "couple-1" });
  const supabase = {
    auth: { getUser: vi.fn(async () => ({ data: { user } })) },
    rpc,
    from: vi.fn((table: string) => {
      if (table === "profiles") return { upsert: profileUpsert };
      if (table === "couple_members") return membership;
      if (table === "partner_lite_checkins") return { upsert: checkinUpsert };
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return { supabase, profileUpsert, rpc, checkinUpsert };
}

describe("saveLiteCheckin", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("returns a login error before accepting or saving when signed out", async () => {
    const refs = createSupabaseMock({ user: null });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await saveLiteCheckin({}, form());

    expect(result.error).toContain("로그인이 필요합니다");
    expect(refs.rpc).not.toHaveBeenCalled();
    expect(refs.checkinUpsert).not.toHaveBeenCalled();
  });

  it("accepts the invite and saves the spouse check-in for the current month", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    await expect(saveLiteCheckin({}, form())).resolves.toEqual({ success: true });

    expect(refs.profileUpsert).toHaveBeenCalledWith({
      id: "lite-1",
      email: "partner@example.com",
      display_name: "Partner",
    });
    expect(refs.rpc).toHaveBeenCalledWith("accept_couple_invite", { invite_token: "invite-token" });
    expect(refs.checkinUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        couple_id: "couple-1",
        user_id: "lite-1",
        month: "2026-05-01",
        income_amount: 3_500_000,
        expense_amount: 1_800_000,
        savings_amount: 800_000,
      }),
      { onConflict: "couple_id,user_id,month" },
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/together");
  });
});
