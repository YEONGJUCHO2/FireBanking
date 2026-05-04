export type FixedCostItem = {
  id: string;
  name: string;
  monthlyAmount: number;
  enabled: boolean;
  note?: string;
};

export type FixedCostCategory = {
  id: string;
  name: string;
  prompt: string;
  items: FixedCostItem[];
};

export type LivingExpenseItem = {
  id: string;
  name: string;
  monthlyAmount: number;
};

export type FixedCostSimulatorConfig = {
  periodMonths: number;
  annualReturnRate: number;
  investmentRatio: number;
  bufferMonthlyAmount: number;
  dashboardBaseline?: {
    targetMonthlyExpense: number;
    fireNetWorth: number;
    monthlyAssetGrowthCapacity: number;
  };
  subscriptionCategories: FixedCostCategory[];
  livingExpenses: LivingExpenseItem[];
};

export type FixedCostProjection = {
  monthlyRecurringFixedExpense: number;
  monthlyVariableExpense: number;
  monthlyBufferExpense: number;
  recommendedTargetMonthlyExpense: number;
  fireTargetAsset: number;
  remainingAmount: number;
  targetMonthlyExpenseDelta: number;
  fireTargetAssetDelta: number;
  remainingAmountDelta: number;
  monthlyAssetGrowthCapacityDelta: number;
  monthlyFixedExpense: number;
  simpleFixedCostTotal: number;
  futureFixedCostImpact: number;
};
