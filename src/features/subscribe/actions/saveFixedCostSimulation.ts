"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { fixedCostSimulationConfigSchema } from "@/src/features/subscribe/lib/fixedCostConfigSchema";
import type { FixedCostSimulatorConfig } from "@/src/features/subscribe/lib/fixedCostTypes";

export type SaveFixedCostSimulationState = {
  error?: string;
  saved?: boolean;
};

export async function saveFixedCostSimulation(
  config: FixedCostSimulatorConfig,
): Promise<SaveFixedCostSimulationState> {
  const parsed = fixedCostSimulationConfigSchema.safeParse(config);

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

export async function getSavedFixedCostSimulationConfig(): Promise<FixedCostSimulatorConfig | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("fixed_cost_simulations")
    .select("config")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const parsed = fixedCostSimulationConfigSchema.safeParse(data.config);
  return parsed.success ? parsed.data : null;
}
