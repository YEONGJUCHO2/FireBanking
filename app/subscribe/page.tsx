import { redirect } from "next/navigation";
import { AppHeader } from "@/src/features/auth/components/AppHeader";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { saveFixedCostSimulation } from "@/src/features/subscribe/actions/saveFixedCostSimulation";
import { FixedCostSimulator } from "@/src/features/subscribe/components/FixedCostSimulator";
import { defaultFixedCostConfig } from "@/src/features/subscribe/lib/fixedCostDefaults";
import type { FixedCostSimulatorConfig } from "@/src/features/subscribe/lib/fixedCostTypes";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

function readConfig(config: unknown): FixedCostSimulatorConfig {
  if (!config || typeof config !== "object") {
    return defaultFixedCostConfig;
  }

  return config as FixedCostSimulatorConfig;
}

export default async function SubscribePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const { data: simulation } = await supabase
    .from("fixed_cost_simulations")
    .select("config")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <AppHeader links={[{ href: "/dashboard", label: "대시보드로 돌아가기" }]} />
        <FixedCostSimulator
          initialConfig={readConfig(simulation?.config)}
          saveAction={saveFixedCostSimulation}
        />
      </div>
    </main>
  );
}
