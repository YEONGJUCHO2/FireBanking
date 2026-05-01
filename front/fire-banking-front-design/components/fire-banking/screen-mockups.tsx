import { dashboardMetrics, liteRows, onboardingRows } from '@/lib/sample-data'
import { formatManWon } from '@/lib/format'
import { AppHeader, HeaderIconButton } from './app-shell'
import { BrandLockup } from './brand'
import { Button } from './button'
import { CashflowSummary } from './cashflow-summary'
import { FireHeroCard } from './fire-hero-card'
import { FixedCostSimulator } from './fixed-cost-simulator'
import { InviteCard } from './invite-card'
import { MetricCard } from './metric-card'
import { MoneyInputRow } from './form-field'
import { ProgressStepper } from './progress-stepper'
import { BottomNav } from './bottom-nav'
import { Icon } from './icons'

/**
 * 7화면 평행 배열용 미니 mockup. 안쪽은 고정 360x780 디자인 폭으로 렌더하고
 * 외부에서 transform: scale로 축소. showcase 그리드에서 1행 6 ~ 7개 사용.
 */
export function PhoneMockup({ children, label, subtitle, index, scale = 0.6 }: { children: React.ReactNode; label?: string; subtitle?: string; index?: number; scale?: number }) {
  const designWidth = 360
  const designHeight = 780
  return (
    <div className="flex flex-col">
      {label ? (
        <div className="mb-3 flex items-start gap-2">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-fb-green text-[10px] font-bold text-white">{index ?? '•'}</span>
          <div>
            <p className="text-[13px] font-bold tracking-[-0.03em] text-fb-ink leading-tight">{label}</p>
            {subtitle ? <p className="mt-0.5 text-[11px] text-fb-muted leading-tight">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <div
        className="fb-phone-frame relative overflow-hidden bg-fb-surface"
        style={{ width: designWidth * scale, height: designHeight * scale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: designWidth, height: designHeight, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginScreenPreview() {
  return (
    <div className="flex h-full flex-col px-5 py-6">
      <BrandLockup />
      <section className="mt-12">
        <p className="text-sm font-bold text-fb-green">월 1회, 3분 체크인</p>
        <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-[-0.07em] text-fb-ink">부부가 함께<br />순자산과 경제적 자유<br />진척을 확인해요.</h1>
        <p className="mt-4 text-base leading-7 text-fb-muted">같은 숫자를 보고 돈 이야기를 덜 불편하게 시작합니다.</p>
      </section>
      <div className="mt-auto">
        <div className="relative h-56 overflow-hidden rounded-[1.75rem] border border-fb-line bg-[linear-gradient(180deg,#f2e9dc_0%,#f2f8f5_100%)] shadow-card">
          <div className="absolute left-1/2 top-16 size-12 -translate-x-1/2 rounded-full bg-white shadow-[0_0_48px_rgba(255,255,255,0.9)]" />
          <div className="absolute bottom-0 left-[-18%] h-28 w-[72%] rounded-[100%_100%_0_0] bg-fb-green/45" />
          <div className="absolute bottom-0 right-[-18%] h-36 w-[78%] rounded-[100%_100%_0_0] bg-fb-green-900/42" />
        </div>
        <div className="mt-5 grid gap-3"><Button size="lg">시작하기</Button><Button variant="secondary" size="lg">로그인</Button></div>
      </div>
    </div>
  )
}

export function OnboardingScreenPreview() {
  return (
    <div>
      <AppHeader title="우리 가정의 기본 정보를 입력해 주세요" subtitle="정확하지 않아도 괜찮아요. 지금은 첫 거리감을 보는 단계예요." />
      <form className="space-y-4 px-5 pb-6">
        <div className="flex items-center justify-end gap-2 text-[11px] text-fb-muted"><span>단위</span><strong className="text-fb-ink">만원</strong></div>
        <div className="fb-card divide-y divide-fb-line px-4">
          {onboardingRows.slice(0, 7).map((row) => <MoneyInputRow key={row.label} label={row.label} value={row.value} />)}
        </div>
        <Button className="w-full" size="lg">다음</Button>
        <ProgressStepper steps={['입력', '확인', '완료']} current={0} />
      </form>
    </div>
  )
}

export function DashboardScreenPreview() {
  const m = dashboardMetrics
  return (
    <div>
      <AppHeader title="대시보드" subtitle="우리의 경제적 자유 현황을 한눈에" right={<div className="flex gap-2"><HeaderIconButton icon="bell" label="알림" /><HeaderIconButton icon="users" label="함께" /></div>} />
      <div className="space-y-4 px-5 pb-5">
        <FireHeroCard dateLabel={m.expectedFireDateLabel} distanceLabel={m.expectedFireDistanceLabel} />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard title="표시 순자산" value={formatManWon(m.displayNetWorthMan)} delta={`전월 대비 ${formatManWon(m.displayNetWorthDeltaMan, { signed: true })}`} variant="positive" />
          <MetricCard title="FIRE 계산 순자산" value={formatManWon(m.fireNetWorthMan)} delta={`전월 대비 ${formatManWon(m.fireNetWorthDeltaMan, { signed: true })}`} variant="positive" />
        </div>
        <div className="grid grid-cols-2 gap-3"><MetricCard title="월 자산 증가 여력" value={formatManWon(m.monthlyAssetGrowthCapacityMan)} size="sm" /><MetricCard title="FIRE 목표 자산" value={formatManWon(m.fireTargetAssetMan)} size="sm" /></div>
        <CashflowSummary incomeMan={m.monthlyIncomeMan} livingCostMan={m.monthlyLivingCostMan} regularInvestmentMan={m.monthlyRegularInvestmentMan} remainingMan={m.monthlyIncomeMan - m.monthlyLivingCostMan - m.monthlyRegularInvestmentMan} />
        <div className="rounded-card border border-fb-line bg-fb-sand/70 p-4 text-sm leading-6 text-fb-muted">이 결과는 참고용 시뮬레이션이에요.</div>
      </div>
      <BottomNav active="홈" />
    </div>
  )
}

export function InviteScreenPreview() {
  return (
    <div>
      <AppHeader title="배우자 초대" subtitle="함께하면 더 정확한 결과를 볼 수 있어요" />
      <div className="px-5 pb-5"><InviteCard /></div>
    </div>
  )
}

export function LiteScreenPreview() {
  return (
    <div>
      <AppHeader title="나의 기본 정보 (Lite)" subtitle="간단한 3가지 입력으로 참여해요." />
      <div className="space-y-5 px-5 pb-6">
        <section className="fb-card p-5 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-fb-sand text-fb-green"><Icon name="mail" className="size-7" /></div>
          <h1 className="mt-4 text-2xl font-bold tracking-[-0.06em] text-fb-ink">Fire Banking에 초대받았어요!</h1>
          <p className="mt-2 text-sm leading-6 text-fb-muted">서로를 평가하지 않고, 함께 보기 위한 정보만 입력해요.</p>
        </section>
        <section className="fb-card p-5"><p className="text-sm font-bold text-fb-green">정확하지 않아도 괜찮아요.</p><div className="mt-3 divide-y divide-fb-line">{liteRows.map((row) => <MoneyInputRow key={row.label} label={row.label} value={row.value} soft />)}</div><Button variant="soft" className="mt-5 w-full">지난달과 같아요</Button><Button className="mt-2 w-full">다음</Button></section>
      </div>
    </div>
  )
}

export function SimulatorScreenPreview() {
  return (
    <div>
      <AppHeader title="고정비 시뮬레이터" subtitle="고정비를 줄이면 미래가 달라져요." />
      <div className="px-5 pb-5"><FixedCostSimulator /></div>
    </div>
  )
}
