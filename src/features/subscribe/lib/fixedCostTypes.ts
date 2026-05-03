export type FixedCostItem = {
  id: string;
  name: string;
  monthlyAmount: number;
  enabled: boolean;
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
  monthlyIncome: number;
  periodMonths: number;
  annualReturnRate: number;
  investmentRatio: number;
  subscriptionCategories: FixedCostCategory[];
  livingExpenses: LivingExpenseItem[];
};

export type FixedCostProjection = {
  monthlyFixedExpense: number;
  monthlyRemainingCash: number;
  monthlyInvestmentAmount: number;
  simpleFixedCostTotal: number;
  futureFixedCostImpact: number;
  futureInvestmentValue: number;
  fireMonthsSaved: number;
};
