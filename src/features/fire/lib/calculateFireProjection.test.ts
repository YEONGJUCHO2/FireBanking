import { describe, expect, it } from "vitest";
import { calculateFireProjection } from "./calculateFireProjection";

describe("calculateFireProjection", () => {
  it("calculates target asset and monthly growth capacity from total inputs", () => {
    const result = calculateFireProjection({
      investableNetWorth: 120_000_000,
      primaryResidenceNetWorth: 700_000_000,
      otherNetWorth: 20_000_000,
      monthlyNetIncome: 7_200_000,
      monthlyFixedExpense: 2_300_000,
      monthlyVariableExpense: 1_700_000,
      monthlyRegularInvestment: 2_000_000,
      annualReturnRate: 0.05,
      fireMultiplier: 25,
      startDate: new Date("2026-04-01T00:00:00.000Z"),
    });

    expect(result.totalNetWorthForDisplay).toBe(840_000_000);
    expect(result.fireCalculationNetWorth).toBe(120_000_000);
    expect(result.monthlyLivingExpense).toBe(4_000_000);
    expect(result.annualLivingExpense).toBe(48_000_000);
    expect(result.fireTargetAsset).toBe(1_200_000_000);
    expect(result.remainingCash).toBe(1_200_000);
    expect(result.monthlyAssetGrowthCapacity).toBe(3_200_000);
    expect(result.projectedFireDate).toBeInstanceOf(Date);
    expect(result.monthsToFire).toBeGreaterThan(0);
  });

  it("returns no projected date when growth is impossible and target is not reached", () => {
    const result = calculateFireProjection({
      investableNetWorth: 10_000_000,
      primaryResidenceNetWorth: 500_000_000,
      otherNetWorth: 0,
      monthlyNetIncome: 3_000_000,
      monthlyFixedExpense: 2_000_000,
      monthlyVariableExpense: 1_500_000,
      monthlyRegularInvestment: 0,
      annualReturnRate: 0.05,
      fireMultiplier: 25,
      startDate: new Date("2026-04-01T00:00:00.000Z"),
    });

    expect(result.monthlyAssetGrowthCapacity).toBe(-500_000);
    expect(result.projectedFireDate).toBeNull();
    expect(result.monthsToFire).toBeNull();
  });

  it("returns the start month when current net worth already reaches target", () => {
    const startDate = new Date("2026-04-01T00:00:00.000Z");
    const result = calculateFireProjection({
      investableNetWorth: 1_300_000_000,
      primaryResidenceNetWorth: 0,
      otherNetWorth: 0,
      monthlyNetIncome: 7_200_000,
      monthlyFixedExpense: 2_300_000,
      monthlyVariableExpense: 1_700_000,
      monthlyRegularInvestment: 2_000_000,
      annualReturnRate: 0.05,
      fireMultiplier: 25,
      startDate,
    });

    expect(result.projectedFireDate?.toISOString()).toBe(startDate.toISOString());
    expect(result.monthsToFire).toBe(0);
  });
});
