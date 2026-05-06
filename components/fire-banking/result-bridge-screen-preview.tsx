"use client";

import { OnboardingResultBridge } from "./onboarding-result-bridge";

export function ResultBridgeScreenPreview() {
  return (
    <OnboardingResultBridge
      targetAssetMan={140000}
      currentNetWorthMan={20000}
      remainingMan={120000}
      targetMonthlyExpenseMan={250}
      onInviteSpouse={() => undefined}
      onContinueToDashboard={() => undefined}
    />
  );
}
