import { describe, expect, it } from "vitest";
import { shouldRedirectOnboardingToDashboard } from "./onboardingAccess";

describe("shouldRedirectOnboardingToDashboard", () => {
  it("sends spouse read-only accounts back to the shared dashboard", () => {
    expect(shouldRedirectOnboardingToDashboard("lite")).toBe(true);
  });

  it("keeps owner and new accounts in onboarding", () => {
    expect(shouldRedirectOnboardingToDashboard("admin")).toBe(false);
    expect(shouldRedirectOnboardingToDashboard(null)).toBe(false);
  });
});
