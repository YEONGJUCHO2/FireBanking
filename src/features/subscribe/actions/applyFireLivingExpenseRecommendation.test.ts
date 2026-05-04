import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultFixedCostConfig } from "@/src/features/subscribe/lib/fixedCostDefaults";
import { applyFireLivingExpenseRecommendation } from "./applyFireLivingExpenseRecommendation";

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

function createBuilder(result: unknown) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
    update: vi.fn(() => builder),
  };

  return builder;
}

describe("applyFireLivingExpenseRecommendation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T06:00:00.000Z"));
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("updates the current dashboard snapshot only when recommendation is applied", async () => {
    const membershipBuilder = createBuilder({
      data: { couple_id: "couple-1" },
      error: null,
    });
    const snapshotBuilder = createBuilder({
      data: {
        total_income: 7_200_000,
        investable_net_worth: 120_000_000,
        primary_residence_net_worth: 0,
        other_net_worth: 0,
        regular_investment: 2_000_000,
      },
      error: null,
    });
    const updateBuilder = createBuilder({ data: null, error: null });
    const from = vi.fn((table: string) => {
      if (table === "couple_members") {
        return membershipBuilder;
      }

      if (table === "monthly_cashflow_snapshots") {
        return snapshotBuilder.update.mock.calls.length > 0 ? updateBuilder : snapshotBuilder;
      }

      throw new Error(`Unexpected table: ${table}`);
    });
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from,
    });

    const result = await applyFireLivingExpenseRecommendation({
      ...defaultFixedCostConfig,
      bufferMonthlyAmount: 200_000,
      subscriptionCategories: [
        {
          id: "fixed",
          name: "고정비",
          prompt: "",
          items: [{ id: "rent", name: "주거", monthlyAmount: 1_000_000, enabled: true }],
        },
      ],
      livingExpenses: [{ id: "food", name: "식비", monthlyAmount: 900_000 }],
    });

    expect(result).toEqual({ applied: true });
    expect(snapshotBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        fixed_expense: 1_000_000,
        variable_expense: 1_100_000,
        annual_fire_expense: 25_200_000,
        fire_target_asset: 630_000_000,
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
