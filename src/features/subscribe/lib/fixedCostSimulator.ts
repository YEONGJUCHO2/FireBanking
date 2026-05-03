import type { FixedCostProjection, FixedCostSimulatorConfig } from "./fixedCostTypes";

function futureValueOfMonthlyPayment(monthlyPayment: number, months: number, annualRate: number) {
  if (monthlyPayment <= 0 || months <= 0) {
    return 0;
  }

  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }

  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

export function calculateFixedCostProjection(
  config: FixedCostSimulatorConfig,
): FixedCostProjection {
  const subscriptionTotal = config.subscriptionCategories.reduce(
    (categoryTotal, category) =>
      categoryTotal +
      category.items.reduce(
        (itemTotal, item) => itemTotal + (item.enabled ? item.monthlyAmount : 0),
        0,
      ),
    0,
  );
  const livingTotal = config.livingExpenses.reduce(
    (total, item) => total + Math.max(item.monthlyAmount, 0),
    0,
  );
  const monthlyFixedExpense = subscriptionTotal + livingTotal;
  const monthlyRemainingCash = Math.max(config.monthlyIncome - monthlyFixedExpense, 0);
  const monthlyInvestmentAmount = Math.round(monthlyRemainingCash * config.investmentRatio);
  const futureFixedCostImpact = Math.round(
    futureValueOfMonthlyPayment(
      monthlyFixedExpense,
      config.periodMonths,
      config.annualReturnRate,
    ),
  );

  return {
    monthlyFixedExpense,
    monthlyRemainingCash,
    monthlyInvestmentAmount,
    simpleFixedCostTotal: monthlyFixedExpense * config.periodMonths,
    futureFixedCostImpact,
    futureInvestmentValue: Math.round(
      futureValueOfMonthlyPayment(
        monthlyInvestmentAmount,
        config.periodMonths,
        config.annualReturnRate,
      ),
    ),
    fireMonthsSaved: Math.max(0, Math.round(futureFixedCostImpact / 2_000_000)),
  };
}
