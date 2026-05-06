import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingResultBridge } from "./onboarding-result-bridge";

describe("OnboardingResultBridge", () => {
  it("renders the first FIRE result summary, remaining amount, and dual CTA", () => {
    render(
      <OnboardingResultBridge
        targetAssetMan={140000}
        currentNetWorthMan={20000}
        remainingMan={120000}
        targetMonthlyExpenseMan={250}
        onInviteSpouse={vi.fn()}
        onContinueToDashboard={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /첫 FIRE 결과|FIRE 결과/ })).toBeVisible();
    expect(screen.getByText(/남은 금액/)).toBeVisible();
    expect(screen.getByRole("button", { name: /배우자에게/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /먼저 대시보드/ })).toBeVisible();
  });

  it("calls onInviteSpouse when the primary CTA is clicked", async () => {
    const onInvite = vi.fn();
    const { getByRole } = render(
      <OnboardingResultBridge
        targetAssetMan={140000}
        currentNetWorthMan={20000}
        remainingMan={120000}
        targetMonthlyExpenseMan={250}
        onInviteSpouse={onInvite}
        onContinueToDashboard={vi.fn()}
      />,
    );
    getByRole("button", { name: /배우자에게/ }).click();
    expect(onInvite).toHaveBeenCalledOnce();
  });
});
