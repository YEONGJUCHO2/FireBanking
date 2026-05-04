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
  const monthlyRecurringFixedExpense = config.subscriptionCategories.reduce(
    (categoryTotal, category) =>
      categoryTotal +
      category.items.reduce(
        (itemTotal, item) => itemTotal + (item.enabled ? item.monthlyAmount : 0),
        0,
    ),
    0,
  );
  const monthlyVariableExpense = config.livingExpenses.reduce(
    (total, item) => total + Math.max(item.monthlyAmount, 0),
    0,
  );
  const monthlyBufferExpense = Math.max(config.bufferMonthlyAmount ?? 0, 0);
  const recommendedTargetMonthlyExpense =
    monthlyRecurringFixedExpense + monthlyVariableExpense + monthlyBufferExpense;
  const monthlyFixedExpense = recommendedTargetMonthlyExpense;
  const fireTargetAsset = recommendedTargetMonthlyExpense * 12 * 25;
  const remainingAmount = Math.max(
    fireTargetAsset - (config.dashboardBaseline?.fireNetWorth ?? 0),
    0,
  );
  const baselineTargetMonthlyExpense = config.dashboardBaseline?.targetMonthlyExpense ?? 0;
  const baselineFireTargetAsset = baselineTargetMonthlyExpense * 12 * 25;
  const baselineRemainingAmount = Math.max(
    baselineFireTargetAsset - (config.dashboardBaseline?.fireNetWorth ?? 0),
    0,
  );
  const futureFixedCostImpact = Math.round(
    futureValueOfMonthlyPayment(
      monthlyFixedExpense,
      config.periodMonths,
      config.annualReturnRate,
    ),
  );

  return {
    monthlyRecurringFixedExpense,
    monthlyVariableExpense,
    monthlyBufferExpense,
    recommendedTargetMonthlyExpense,
    fireTargetAsset,
    remainingAmount,
    targetMonthlyExpenseDelta: recommendedTargetMonthlyExpense - baselineTargetMonthlyExpense,
    fireTargetAssetDelta: fireTargetAsset - baselineFireTargetAsset,
    remainingAmountDelta: remainingAmount - baselineRemainingAmount,
    monthlyAssetGrowthCapacityDelta: 0 - (config.dashboardBaseline?.monthlyAssetGrowthCapacity ?? 0),
    monthlyFixedExpense,
    simpleFixedCostTotal: monthlyFixedExpense * config.periodMonths,
    futureFixedCostImpact,
  };
}
