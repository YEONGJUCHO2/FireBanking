import { describe, expect, it } from "vitest";
import { calculateFixedCostProjection } from "./fixedCostSimulator";

describe("calculateFixedCostProjection", () => {
  it("calculates recommended FIRE living expense from fixed, variable, and buffer inputs", () => {
    const result = calculateFixedCostProjection({
      periodMonths: 120,
      annualReturnRate: 0.05,
      investmentRatio: 0.5,
      bufferMonthlyAmount: 300_000,
      dashboardBaseline: {
        targetMonthlyExpense: 3_000_000,
        fireNetWorth: 120_000_000,
        monthlyAssetGrowthCapacity: 2_000_000,
      },
      subscriptionCategories: [
        {
          id: "digital",
          name: "디지털 구독",
          prompt: "구독",
          items: [
            { id: "youtube", name: "유튜브 프리미엄", monthlyAmount: 14_900, enabled: true },
            { id: "chatgpt", name: "ChatGPT Plus", monthlyAmount: 30_000, enabled: false },
          ],
        },
      ],
      livingExpenses: [{ id: "food", name: "식비", monthlyAmount: 1_000_000 }],
    });

    expect(result.monthlyRecurringFixedExpense).toBe(14_900);
    expect(result.monthlyVariableExpense).toBe(1_000_000);
    expect(result.monthlyBufferExpense).toBe(300_000);
    expect(result.recommendedTargetMonthlyExpense).toBe(1_314_900);
    expect(result.fireTargetAsset).toBe(394_470_000);
    expect(result.remainingAmount).toBe(274_470_000);
    expect(result.targetMonthlyExpenseDelta).toBe(-1_685_100);
    expect(result.monthlyFixedExpense).toBe(1_314_900);
    expect(result.simpleFixedCostTotal).toBe(157_788_000);
    expect(result.futureFixedCostImpact).toBeGreaterThan(result.simpleFixedCostTotal);
  });

  it("clamps negative item and buffer amounts out of the living expense total", () => {
    const result = calculateFixedCostProjection({
      periodMonths: 120,
      annualReturnRate: 0.05,
      investmentRatio: 1,
      bufferMonthlyAmount: -100_000,
      subscriptionCategories: [
        {
          id: "debt",
          name: "금융/보험",
          prompt: "보험",
          items: [{ id: "loan", name: "대출", monthlyAmount: 2_000_000, enabled: true }],
        },
      ],
      livingExpenses: [{ id: "food", name: "식비", monthlyAmount: -500_000 }],
    });

    expect(result.monthlyRecurringFixedExpense).toBe(2_000_000);
    expect(result.monthlyVariableExpense).toBe(0);
    expect(result.monthlyBufferExpense).toBe(0);
    expect(result.recommendedTargetMonthlyExpense).toBe(2_000_000);
  });
});
