"use client";

import { useRouter } from "next/navigation";
import { OnboardingResultBridge } from "@/components/fire-banking/onboarding-result-bridge";

export interface ResultBridgeClientProps {
  targetAssetMan: number;
  currentNetWorthMan: number;
  remainingMan: number;
  targetMonthlyExpenseMan: number;
}

export function ResultBridgeClient({
  targetAssetMan,
  currentNetWorthMan,
  remainingMan,
  targetMonthlyExpenseMan,
}: ResultBridgeClientProps) {
  const router = useRouter();

  return (
    <OnboardingResultBridge
      targetAssetMan={targetAssetMan}
      currentNetWorthMan={currentNetWorthMan}
      remainingMan={remainingMan}
      targetMonthlyExpenseMan={targetMonthlyExpenseMan}
      onInviteSpouse={() => router.push("/together")}
      onContinueToDashboard={() => router.push("/dashboard")}
    />
  );
}
