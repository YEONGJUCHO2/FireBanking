export const FIRE_MONTHLY_EXPENSE_BUFFER_RATE = 0.1;

export function suggestFireMonthlyExpenseFromSpending(monthlySpending: number) {
  if (!Number.isFinite(monthlySpending) || monthlySpending <= 0) {
    return 0;
  }

  return Math.round(monthlySpending * (1 + FIRE_MONTHLY_EXPENSE_BUFFER_RATE));
}
