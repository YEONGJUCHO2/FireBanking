import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveR0Snapshot } from "./saveR0Snapshot";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

type MockUser = {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
  };
};

type SupabaseMockOptions = {
  user?: MockUser | null;
  profileError?: unknown;
  existingMembership?: { couple_id: string } | null;
  membershipLookupError?: unknown;
  coupleId?: string;
  memberInsertError?: unknown;
  recoveredMembership?: { couple_id: string } | null;
  snapshotError?: unknown;
};

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    targetMonthlyExpense: "300",
    monthlyNetIncome: "720",
    investableNetWorth: "12000",
    monthlyTotalExpense: "400",
    ...overrides,
  };

  Object.entries(values).forEach(([key, value]) => formData.set(key, value));

  return formData;
}

function createMembershipLookupBuilder(
  data: { couple_id: string } | null,
  error: unknown = null,
) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error })),
  };

  return builder;
}

function createCoupleInsertBuilder(coupleId: string) {
  const builder = {
    insert: vi.fn(() => builder),
    select: vi.fn(() => builder),
    single: vi.fn(async () => ({ data: { id: coupleId }, error: null })),
  };

  return builder;
}

function createSupabaseMock(options: SupabaseMockOptions = {}) {
  const user = options.user === undefined
    ? {
        id: "user-1",
        email: "lead@example.com",
        user_metadata: { full_name: "리드" },
      }
    : options.user;
  const profileUpsert = vi.fn(async () => ({ error: options.profileError ?? null }));
  const firstMembershipLookup = createMembershipLookupBuilder(
    options.existingMembership ?? null,
    options.membershipLookupError ?? null,
  );
  const memberInsert = vi.fn(async () => ({ error: options.memberInsertError ?? null }));
  const recoveryMembershipLookup = createMembershipLookupBuilder(
    options.recoveredMembership ?? null,
  );
  const coupleInsert = createCoupleInsertBuilder(options.coupleId ?? "couple-new");
  const snapshotUpsert = vi.fn(async () => ({ error: options.snapshotError ?? null }));
  const coupleMemberQueue = [
    firstMembershipLookup,
    { insert: memberInsert },
    recoveryMembershipLookup,
  ];

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
    },
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return { upsert: profileUpsert };
      }

      if (table === "couples") {
        return coupleInsert;
      }

      if (table === "couple_members") {
        return coupleMemberQueue.shift();
      }

      if (table === "monthly_cashflow_snapshots") {
        return { upsert: snapshotUpsert };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return {
    supabase,
    profileUpsert,
    firstMembershipLookup,
    memberInsert,
    recoveryMembershipLookup,
    coupleInsert,
    snapshotUpsert,
  };
}

describe("saveR0Snapshot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-25T12:00:00.000Z"));
    mocks.createSupabaseServerClient.mockReset();
    mocks.redirect.mockClear();
    mocks.revalidatePath.mockClear();
  });

  it("returns the first validation error and does not call Supabase for invalid form data", async () => {
    const result = await saveR0Snapshot(
      {},
      createFormData({ monthlyNetIncome: "" }),
    );

    expect(result.error).toBeTruthy();
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns a login error when there is no authenticated user", async () => {
    const refs = createSupabaseMock({ user: null });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await saveR0Snapshot({}, createFormData());

    expect(result).toEqual({ error: "로그인이 필요합니다." });
    expect(refs.profileUpsert).not.toHaveBeenCalled();
  });

  it("returns a profile error when profile upsert fails", async () => {
    const refs = createSupabaseMock({ profileError: new Error("profile failed") });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await saveR0Snapshot({}, createFormData());

    expect(result).toEqual({ error: "프로필을 저장하지 못했습니다." });
    expect(refs.profileUpsert).toHaveBeenCalledOnce();
  });

  it("writes a monthly snapshot with calculated FIRE fields for an existing membership", async () => {
    const refs = createSupabaseMock({
      existingMembership: { couple_id: "couple-existing" },
    });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    await expect(saveR0Snapshot({}, createFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard",
    );

    expect(refs.snapshotUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        couple_id: "couple-existing",
        created_by: "user-1",
        month: "2026-04-01",
        total_income: 7_200_000,
        investable_net_worth: 120_000_000,
        primary_residence_net_worth: 0,
        other_net_worth: 0,
        total_net_worth_for_display: 120_000_000,
        fire_calculation_net_worth: 120_000_000,
        fixed_expense: 4_000_000,
        variable_expense: 0,
        regular_investment: 0,
        remaining_cash: 3_200_000,
        monthly_asset_growth_capacity: 3_200_000,
        annual_fire_expense: 36_000_000,
        fire_target_asset: 900_000_000,
      }),
      { onConflict: "couple_id,month" },
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("creates a couple and lead-partner membership before writing a snapshot", async () => {
    const refs = createSupabaseMock({
      existingMembership: null,
      coupleId: "couple-new",
    });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    await expect(saveR0Snapshot({}, createFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard",
    );

    expect(refs.coupleInsert.insert).toHaveBeenCalledWith({
      created_by: "user-1",
      name: "리드님의 FIRE 워크스페이스",
    });
    expect(refs.memberInsert).toHaveBeenCalledWith({
      couple_id: "couple-new",
      user_id: "user-1",
      role: "admin",
    });
    expect(refs.snapshotUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ couple_id: "couple-new" }),
      { onConflict: "couple_id,month" },
    );
  });

  it("recovers an existing membership after a membership insert race", async () => {
    const refs = createSupabaseMock({
      existingMembership: null,
      coupleId: "couple-raced",
      memberInsertError: new Error("duplicate membership"),
      recoveredMembership: { couple_id: "couple-recovered" },
    });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    await expect(saveR0Snapshot({}, createFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard",
    );

    expect(refs.recoveryMembershipLookup.maybeSingle).toHaveBeenCalledOnce();
    expect(refs.snapshotUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ couple_id: "couple-recovered" }),
      { onConflict: "couple_id,month" },
    );
  });

  it("returns a snapshot error when snapshot upsert fails", async () => {
    const refs = createSupabaseMock({
      existingMembership: { couple_id: "couple-existing" },
      snapshotError: new Error("snapshot failed"),
    });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await saveR0Snapshot({}, createFormData());

    expect(result).toEqual({ error: "이번 달 스냅샷을 저장하지 못했습니다." });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
