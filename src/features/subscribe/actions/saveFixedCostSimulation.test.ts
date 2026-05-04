import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultFixedCostConfig } from "@/src/features/subscribe/lib/fixedCostDefaults";
import {
  getSavedFixedCostSimulationConfig,
  saveFixedCostSimulation,
} from "./saveFixedCostSimulation";

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

describe("fixed cost simulation actions", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("saves configs with buffer expense state", async () => {
    const upsert = vi.fn(async () => ({ error: null }));
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => ({ upsert })),
    });

    const result = await saveFixedCostSimulation({
      ...defaultFixedCostConfig,
      bufferMonthlyAmount: 250_000,
    });

    expect(result).toEqual({ saved: true });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        config: expect.objectContaining({ bufferMonthlyAmount: 250_000 }),
      }),
      { onConflict: "user_id" },
    );
  });

  it("loads the saved config for the current user", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: { config: { ...defaultFixedCostConfig, bufferMonthlyAmount: 150_000 } },
      error: null,
    }));
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle,
    };
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => builder),
    });

    await expect(getSavedFixedCostSimulationConfig()).resolves.toEqual(
      expect.objectContaining({ bufferMonthlyAmount: 150_000 }),
    );
  });

  it("returns null for legacy saved configs that do not match the current schema", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: { config: { monthlyIncome: 4_000_000 } },
      error: null,
    }));
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle,
    };
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => builder),
    });

    await expect(getSavedFixedCostSimulationConfig()).resolves.toBeNull();
  });
});
