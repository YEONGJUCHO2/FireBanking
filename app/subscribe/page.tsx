import Link from "next/link";
import { redirect } from "next/navigation";
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
    <main className="min-h-screen bg-stone-50 px-6 py-8 text-slate-950">
      <div className="mx-auto grid max-w-5xl gap-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600">Fire Banking</p>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            대시보드로 돌아가기
          </Link>
        </div>
        <FixedCostSimulator
          initialConfig={readConfig(simulation?.config)}
          saveAction={saveFixedCostSimulation}
        />
      </div>
    </main>
  );
}
