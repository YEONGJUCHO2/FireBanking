export type FireProjectionInput = {
  investableNetWorth: number;
  primaryResidenceNetWorth: number;
  otherNetWorth: number;
  monthlyNetIncome: number;
  monthlyFixedExpense: number;
  monthlyVariableExpense: number;
  monthlyRegularInvestment: number;
  annualReturnRate: number;
  fireMultiplier: number;
  startDate: Date;
};

export type FireProjectionResult = {
  totalNetWorthForDisplay: number;
  fireCalculationNetWorth: number;
  monthlyLivingExpense: number;
  annualLivingExpense: number;
  fireTargetAsset: number;
  remainingAmount: number;
  remainingCash: number;
  monthlyAssetGrowthCapacity: number;
  projectedFireDate: Date | null;
  monthsToFire: number | null;
};
