import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { getDashboardCashflowSnapshot } from "@/src/features/dashboard/lib/getDashboardCashflowSnapshot";
import { ResultBridgeClient } from "./ResultBridgeClient";

export default async function OnboardingResultPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const snapshot = await getDashboardCashflowSnapshot();
  if (!snapshot) {
    redirect("/onboarding");
  }

  // Derive the four values from the snapshot
  // fire_target_asset and investable_net_worth are stored in 만원 units
  const targetAssetMan = snapshot.fire_target_asset;
  const currentNetWorthMan = snapshot.fire_calculation_net_worth;
  const remainingMan = Math.max(0, targetAssetMan - currentNetWorthMan);
  // annual_fire_expense / 12 gives monthly expense in 만원
  const targetMonthlyExpenseMan = Math.round(snapshot.annual_fire_expense / 12);

  return (
    <div data-screen-label="onboarding-result-page">
      <ResultBridgeClient
        targetAssetMan={targetAssetMan}
        currentNetWorthMan={currentNetWorthMan}
        remainingMan={remainingMan}
        targetMonthlyExpenseMan={targetMonthlyExpenseMan}
      />
    </div>
  );
}
