import { describe, expect, it } from "vitest";
import { calculateFixedCostProjection } from "./fixedCostSimulator";

describe("calculateFixedCostProjection", () => {
  it("calculates monthly fixed costs and lost future value", () => {
    const result = calculateFixedCostProjection({
      monthlyIncome: 4_000_000,
      periodMonths: 120,
      annualReturnRate: 0.05,
      investmentRatio: 0.5,
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

    expect(result.monthlyFixedExpense).toBe(1_014_900);
    expect(result.monthlyRemainingCash).toBe(2_985_100);
    expect(result.monthlyInvestmentAmount).toBe(1_492_550);
    expect(result.simpleFixedCostTotal).toBe(121_788_000);
    expect(result.futureFixedCostImpact).toBeGreaterThan(result.simpleFixedCostTotal);
  });

  it("never shows negative remaining cash or investment amount", () => {
    const result = calculateFixedCostProjection({
      monthlyIncome: 1_000_000,
      periodMonths: 120,
      annualReturnRate: 0.05,
      investmentRatio: 1,
      subscriptionCategories: [
        {
          id: "debt",
          name: "금융/보험",
          prompt: "보험",
          items: [{ id: "loan", name: "대출", monthlyAmount: 2_000_000, enabled: true }],
        },
      ],
      livingExpenses: [],
    });

    expect(result.monthlyRemainingCash).toBe(0);
    expect(result.monthlyInvestmentAmount).toBe(0);
  });
});
