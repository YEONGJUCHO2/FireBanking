"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { FixedCostSimulatorConfig } from "@/src/features/subscribe/lib/fixedCostTypes";

const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  monthlyAmount: z.number().min(0).max(100_000_000),
  enabled: z.boolean().optional(),
});

const configSchema = z.object({
  monthlyIncome: z.number().min(0).max(1_000_000_000),
  periodMonths: z.number().int().min(1).max(360),
  annualReturnRate: z.number().min(0).max(0.2),
  investmentRatio: z.number().min(0).max(1),
  subscriptionCategories: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      prompt: z.string(),
      items: z.array(itemSchema.extend({ enabled: z.boolean() })),
    }),
  ),
  livingExpenses: z.array(itemSchema.omit({ enabled: true })),
});

export type SaveFixedCostSimulationState = {
  error?: string;
  saved?: boolean;
};

export async function saveFixedCostSimulation(
  config: FixedCostSimulatorConfig,
): Promise<SaveFixedCostSimulationState> {
  const parsed = configSchema.safeParse(config);

  if (!parsed.success) {
    return { error: "저장할 입력값을 확인해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase.from("fixed_cost_simulations").upsert(
    {
      user_id: user.id,
      config: parsed.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: "고정비 시뮬레이션을 저장하지 못했습니다." };
  }

  revalidatePath("/subscribe");
  return { saved: true };
}
