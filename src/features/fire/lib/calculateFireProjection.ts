import type { FireProjectionInput, FireProjectionResult } from "../types";

const MAX_SIMULATION_MONTHS = 12 * 100;

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

export function calculateFireProjection(input: FireProjectionInput): FireProjectionResult {
  const totalNetWorthForDisplay =
    input.investableNetWorth + input.primaryResidenceNetWorth + input.otherNetWorth;
  const fireCalculationNetWorth = input.investableNetWorth;
  const monthlyLivingExpense =
    input.monthlyFixedExpense + input.monthlyVariableExpense + input.monthlyDebtInterestExpense;
  const annualLivingExpense = monthlyLivingExpense * 12;
  const fireTargetAsset = annualLivingExpense * input.fireMultiplier;
  const remainingAmount = Math.max(fireTargetAsset - fireCalculationNetWorth, 0);
  const remainingCash =
    input.monthlyNetIncome -
    input.monthlyFixedExpense -
    input.monthlyVariableExpense -
    input.monthlyDebtInterestExpense -
    input.monthlyDebtPrincipalPayment -
    input.monthlyRegularInvestment;
  const monthlyAssetGrowthCapacity =
    input.monthlyRegularInvestment + input.monthlyDebtPrincipalPayment + remainingCash;

  if (fireCalculationNetWorth >= fireTargetAsset) {
    return {
      totalNetWorthForDisplay,
      fireCalculationNetWorth,
      monthlyLivingExpense,
      annualLivingExpense,
      fireTargetAsset,
      remainingAmount,
      remainingCash,
      monthlyAssetGrowthCapacity,
      projectedFireDate: input.startDate,
      monthsToFire: 0,
    };
  }

  if (monthlyAssetGrowthCapacity <= 0) {
    return {
      totalNetWorthForDisplay,
      fireCalculationNetWorth,
      monthlyLivingExpense,
      annualLivingExpense,
      fireTargetAsset,
      remainingAmount,
      remainingCash,
      monthlyAssetGrowthCapacity,
      projectedFireDate: null,
      monthsToFire: null,
    };
  }

  const monthlyReturnRate = Math.pow(1 + input.annualReturnRate, 1 / 12) - 1;
  let simulatedNetWorth = fireCalculationNetWorth;

  for (let month = 1; month <= MAX_SIMULATION_MONTHS; month += 1) {
    simulatedNetWorth = simulatedNetWorth * (1 + monthlyReturnRate) + monthlyAssetGrowthCapacity;

    if (simulatedNetWorth >= fireTargetAsset) {
      return {
        totalNetWorthForDisplay,
        fireCalculationNetWorth,
        monthlyLivingExpense,
        annualLivingExpense,
        fireTargetAsset,
        remainingAmount,
        remainingCash,
        monthlyAssetGrowthCapacity,
        projectedFireDate: addMonths(input.startDate, month),
        monthsToFire: month,
      };
    }
  }

  return {
    totalNetWorthForDisplay,
    fireCalculationNetWorth,
    monthlyLivingExpense,
    annualLivingExpense,
    fireTargetAsset,
    remainingAmount,
    remainingCash,
    monthlyAssetGrowthCapacity,
    projectedFireDate: null,
    monthsToFire: null,
  };
}
