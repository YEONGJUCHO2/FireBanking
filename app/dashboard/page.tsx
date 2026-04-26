import { AppHeader, BottomNav, CashflowSummary, DesktopDashboard, FireHeroCard, HeaderIconButton, InviteCard, MetricCard, MobileAppShell } from '@/components/fire-banking'
import { dashboardMetrics as m } from '@/lib/sample-data'
import { formatManWon } from '@/lib/format'
import { SignOutButton } from '@/src/features/auth/components/SignOutButton'

export default function DashboardPage() {
  const remainingAfterRegular = m.monthlyIncomeMan - m.monthlyLivingCostMan - m.monthlyRegularInvestmentMan

  return (
    <>
      <div className="lg:hidden">
        <MobileAppShell>
          <AppHeader
            title="대시보드"
            subtitle="우리의 경제적 자유 현황을 한눈에 확인해요."
            right={<div className="flex items-center gap-2"><HeaderIconButton icon="bell" label="알림" /><HeaderIconButton icon="users" label="함께" /><SignOutButton compact /></div>}
          />

          <div className="space-y-4 px-5 pb-5">
            <FireHeroCard dateLabel={m.expectedFireDateLabel} distanceLabel={m.expectedFireDistanceLabel} />

            <div className="grid grid-cols-2 gap-3">
              <MetricCard title="표시 순자산" value={formatManWon(m.displayNetWorthMan)} delta={`전월 대비 ${formatManWon(m.displayNetWorthDeltaMan, { signed: true })}`} variant="positive" />
              <MetricCard title="FIRE 계산 순자산" value={formatManWon(m.fireNetWorthMan)} delta={`전월 대비 ${formatManWon(m.fireNetWorthDeltaMan, { signed: true })}`} variant="positive" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard title="월 자산 증가 여력" value={formatManWon(m.monthlyAssetGrowthCapacityMan)} caption="수입 - 생활비" size="sm" />
              <MetricCard title="FIRE 목표 자산" value={formatManWon(m.fireTargetAssetMan)} caption="월 생활비 × 25배 룰" size="sm" />
            </div>

            <MetricCard title="월 생활비" value={formatManWon(m.monthlyLivingCostMan)} caption={`고정비 ${formatManWon(m.monthlyFixedCostMan)} + 변동비 ${formatManWon(m.monthlyVariableCostMan)}`} size="sm" />

            <CashflowSummary incomeMan={m.monthlyIncomeMan} livingCostMan={m.monthlyLivingCostMan} regularInvestmentMan={m.monthlyRegularInvestmentMan} remainingMan={remainingAfterRegular} />

            <InviteCard />

            <div className="rounded-card border border-fb-line bg-fb-sand/70 p-4 text-sm leading-6 text-fb-muted">이 결과는 참고용 시뮬레이션이에요. 투자 조언이 아니며 실제 결과와 다를 수 있어요.</div>
          </div>

          <BottomNav active="홈" />
        </MobileAppShell>
      </div>

      <div className="hidden min-h-dvh px-8 py-8 lg:block">
        <DesktopDashboard footerAction={<SignOutButton />} />
      </div>
    </>
  )
}
