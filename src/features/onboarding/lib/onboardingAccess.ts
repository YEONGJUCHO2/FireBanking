import type { CoupleRole } from "@/src/features/dashboard/lib/dashboardRoleUi";

export function shouldRedirectOnboardingToDashboard(role: CoupleRole | null): boolean {
  return role === "lite";
}
