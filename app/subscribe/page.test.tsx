import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SubscribePage from "./page";

vi.mock("@/src/features/subscribe/actions/saveFixedCostSimulation", () => ({
  getSavedFixedCostSimulationConfig: vi.fn(async () => null),
  saveFixedCostSimulation: vi.fn(),
}));

vi.mock("@/src/features/subscribe/actions/applyFireLivingExpenseRecommendation", () => ({
  applyFireLivingExpenseRecommendation: vi.fn(),
}));

vi.mock("@/src/features/subscribe/components/FixedCostSimulator", () => ({
  FixedCostSimulator: () => <section>고정비 시뮬레이터 본문</section>,
}));

vi.mock("@/src/features/dashboard/lib/getDashboardCashflowSnapshot", () => ({
  getDashboardCashflowSnapshot: vi.fn(async () => null),
}));

describe("SubscribePage", () => {
  it("keeps the back link inside onboarding when opened from onboarding", async () => {
    render(await SubscribePage({ searchParams: Promise.resolve({ returnTo: "/onboarding" }) }));

    expect(screen.getByRole("link", { name: "온보딩으로" })).toHaveAttribute("href", "/onboarding");
  });

  it("falls back to the dashboard back link for normal dashboard use", async () => {
    render(await SubscribePage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/dashboard");
  });
});
