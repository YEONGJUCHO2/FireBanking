export type FireInputs = {
  monthlyIncomeMan: number
  investableNetWorthMan: number
  residenceNetWorthMan: number
  otherNetWorthMan: number
  monthlyFixedCostMan: number
  monthlyVariableCostMan: number
  monthlyRegularInvestmentMan: number
  annualReturnRate?: number
  fireMultiplier?: number
}

export type FireProjection = {
  displayNetWorthMan: number
  fireNetWorthMan: number
  monthlyLivingCostMan: number
  monthlyAssetGrowthCapacityMan: number
  fireTargetAssetMan: number
  status: 'reached' | 'calculable' | 'unavailable'
  monthsToFire: number | null
  expectedFireDate: Date | null
}

export function calculateFireProjection(input: FireInputs, baseDate = new Date()): FireProjection {
  const annualReturnRate = input.annualReturnRate ?? 0.05
  const fireMultiplier = input.fireMultiplier ?? 25
  const displayNetWorthMan = input.investableNetWorthMan + input.residenceNetWorthMan + input.otherNetWorthMan
  const fireNetWorthMan = input.investableNetWorthMan
  const monthlyLivingCostMan = input.monthlyFixedCostMan + input.monthlyVariableCostMan
  const monthlyAssetGrowthCapacityMan = input.monthlyIncomeMan - monthlyLivingCostMan
  const fireTargetAssetMan = monthlyLivingCostMan * 12 * fireMultiplier

  if (fireNetWorthMan >= fireTargetAssetMan && fireTargetAssetMan > 0) {
    return {
      displayNetWorthMan,
      fireNetWorthMan,
      monthlyLivingCostMan,
      monthlyAssetGrowthCapacityMan,
      fireTargetAssetMan,
      status: 'reached',
      monthsToFire: 0,
      expectedFireDate: baseDate,
    }
  }

  if (fireTargetAssetMan <= 0 || monthlyAssetGrowthCapacityMan <= 0) {
    return {
      displayNetWorthMan,
      fireNetWorthMan,
      monthlyLivingCostMan,
      monthlyAssetGrowthCapacityMan,
      fireTargetAssetMan,
      status: 'unavailable',
      monthsToFire: null,
      expectedFireDate: null,
    }
  }

  const monthlyReturn = annualReturnRate / 12
  let current = fireNetWorthMan
  let months = 0

  while (current < fireTargetAssetMan && months < 100 * 12) {
    current = current * (1 + monthlyReturn) + monthlyAssetGrowthCapacityMan
    months += 1
  }

  if (current < fireTargetAssetMan) {
    return {
      displayNetWorthMan,
      fireNetWorthMan,
      monthlyLivingCostMan,
      monthlyAssetGrowthCapacityMan,
      fireTargetAssetMan,
      status: 'unavailable',
      monthsToFire: null,
      expectedFireDate: null,
    }
  }

  const expectedFireDate = new Date(baseDate)
  expectedFireDate.setMonth(expectedFireDate.getMonth() + months)

  return {
    displayNetWorthMan,
    fireNetWorthMan,
    monthlyLivingCostMan,
    monthlyAssetGrowthCapacityMan,
    fireTargetAssetMan,
    status: 'calculable',
    monthsToFire: months,
    expectedFireDate,
  }
}

export function compoundMonthly(contributionMan: number, years: number, annualReturnRate: number) {
  const months = Math.max(0, Math.round(years * 12))
  const monthlyReturn = annualReturnRate / 12
  let value = 0

  for (let i = 0; i < months; i += 1) {
    value = value * (1 + monthlyReturn) + contributionMan
  }

  return value
}
