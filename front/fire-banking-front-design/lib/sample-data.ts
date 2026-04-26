import type { FireInputs } from './fire-calculator'

export const householdInput: FireInputs = {
  monthlyIncomeMan: 600,
  investableNetWorthMan: 37_450,
  residenceNetWorthMan: 8_700,
  otherNetWorthMan: 3_050,
  monthlyFixedCostMan: 230,
  monthlyVariableCostMan: 180,
  monthlyRegularInvestmentMan: 150,
  annualReturnRate: 0.05,
  fireMultiplier: 25,
}

export const dashboardMetrics = {
  expectedFireDateLabel: '2042년 8월',
  expectedFireDistanceLabel: '17년 3개월 후',
  displayNetWorthMan: 49_200,
  displayNetWorthDeltaMan: 2_800,
  fireNetWorthMan: 37_450,
  fireNetWorthDeltaMan: 320,
  monthlyAssetGrowthCapacityMan: 190,
  fireTargetAssetMan: 123_000,
  monthlyLivingCostMan: 410,
  monthlyIncomeMan: 600,
  monthlyRegularInvestmentMan: 150,
  monthlyFixedCostMan: 230,
  monthlyVariableCostMan: 180,
}

export const onboardingRows = [
  { label: '가구 세후 월수입', value: 600, helper: '월급, 사업소득 등 세후 기준 합산' },
  { label: '투자가능 순자산', value: 37_450, helper: '예금, 투자, 연금 등 FIRE 계산에 쓰이는 금액' },
  { label: '거주 부동산 순자산', value: 8_700, helper: '표시 순자산에는 포함, FIRE 계산에서는 제외' },
  { label: '기타 순자산', value: 3_050, helper: '차량, 보증금 등 별도 자산' },
  { label: '가구 월 고정비 총액', value: 230, helper: '대출, 관리비, 보험료, 통신비 등' },
  { label: '평소 한 달 예상 변동비', value: 180, helper: '식비, 교통, 생활비 등 대략 입력' },
  { label: '월 정기저축/투자', value: 150, helper: '자동이체되는 저축과 투자 합계' },
]

export const liteRows = [
  { label: '내 세후 월수입', value: 300 },
  { label: '내 월 반복지출 총액', value: 150 },
  { label: '내 월 정기저축/투자 총액', value: 80 },
]

export const fixedCostItems = [
  { id: 'housing', label: '주거비(대출/관리비)', amountMan: 100, active: true },
  { id: 'communication', label: '통신비', amountMan: 15, active: true },
  { id: 'insurance', label: '보험료', amountMan: 30, active: true },
  { id: 'subscription', label: '구독/멤버십', amountMan: 12, active: true },
  { id: 'car', label: '차량유지비', amountMan: 40, active: true },
  { id: 'education', label: '교육비', amountMan: 15, active: true },
  { id: 'etc', label: '기타 고정비', amountMan: 18, active: true },
]
