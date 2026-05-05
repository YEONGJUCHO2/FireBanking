import Link from 'next/link'
import {
  BottomNav,
  CashflowSummary,
  MobileAppShell,
  ScreenTopBar,
  StatusPill,
} from '@/components/fire-banking'
import { Card } from '@/components/fire-banking/card'
import { CheckinRow } from '@/components/fire-banking/checkin-row'
import { FireHeroCard } from '@/components/fire-banking/fire-hero-card'
import { Icon } from '@/components/fire-banking/icons'
import { MetricCard } from '@/components/fire-banking/metric-card'
import { NetWorthHero } from '@/components/fire-banking/networth-hero'
import { SignOutButton } from '@/src/features/auth/components/SignOutButton'
import { formatCheckinMonthLabel } from '@/src/lib/checkinDate'

// Static mock data: this preview route demonstrates the new visual treatment.
// The Supabase-connected production dashboard lives at app/dashboard/page.tsx (/dashboard).
const data = {
  totalNetWorthMan: 51_500,
  netWorthDeltaMan: 320,
  homeMan: 38_000,
  investableMan: 13_500,
  otherMan: 1_500,
  targetMonthlyExpenseMan: 300,
  fireTargetMan: 90_000,
  incomeMan: 850,
  fixedMan: 350,
  variableMan: 220,
  saveMan: 180,
  monthlyAddMan: 280,
  fireYears: 8,
  fireMonths: 4,
  // Partner state: 'none' | 'sent' | 'accepted' | 'completed'
  partnerStatus: 'sent' as 'none' | 'sent' | 'accepted' | 'completed',
  myName: '나',
}

function DashboardMobilePage() {
  const percent = Math.max(0, Math.min(1, data.investableMan / data.fireTargetMan))
  const isOverTarget = data.investableMan >= data.fireTargetMan

  // Checkin pill state from prototype
  const checkinPill = (() => {
    if (data.partnerStatus === 'completed') return { tone: 'positive' as const, dot: 'bg-fb-positive', text: '체크인 확정' }
    if (data.partnerStatus === 'accepted') return { tone: 'trust' as const, dot: 'bg-fb-trust', text: '배우자 입력 대기' }
    if (data.partnerStatus === 'sent') return { tone: 'trust' as const, dot: 'bg-fb-trust', text: '배우자 수락 대기' }
    return { tone: 'neutral' as const, dot: 'bg-fb-ink-4', text: '관리자 단독' }
  })()

  // Spouse check-in card hides entirely when Lite input is complete (partnerStatus === 'completed')
  const showSpouseCard = data.partnerStatus !== 'completed'

  return (
    <div data-screen-label="dashboard">
      <MobileAppShell>
        <ScreenTopBar
          right={
            <button
              aria-label="설정"
              className="fbpress flex size-9 items-center justify-center rounded-full text-fb-ink-2 hover:bg-fb-card-alt"
            >
              <Icon name="settings" className="size-5" />
            </button>
          }
        />

        <main className="flex-1 overflow-auto px-4 pb-20 pt-5">
          {/* Month label + greeting + status pill */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
                {formatCheckinMonthLabel()}
              </div>
              <div className="mt-0.5 text-[18px] font-bold tracking-[-0.012em] text-fb-ink">
                <span>안녕하세요</span>
                {data.myName ? <span className="text-fb-trust">, {data.myName}님</span> : null}
              </div>
            </div>
            <StatusPill tone={checkinPill.tone} icon={<span className={`size-1.5 rounded-full ${checkinPill.dot}`} />}>
              {checkinPill.text}
            </StatusPill>
          </div>

          {/* Hero: NetWorthHero card with rounded-[24px] shadow-elevated */}
          <div data-od-id="hero-fire">
            <NetWorthHero
              targetMonthlyExpenseManWon={data.targetMonthlyExpenseMan}
              fireNetWorthManWon={data.investableMan}
              monthlyGrowthManWon={data.monthlyAddMan}
              fireTargetManWon={data.fireTargetMan}
              years={data.fireYears}
              months={data.fireMonths}
              className="shadow-elevated"
            />
          </div>

          {/* FireTimeline card — separate card per prototype */}
          <div data-od-id="fire-timeline" className="mt-4">
            <FireHeroCard
              percent={percent}
              years={data.fireYears}
              months={data.fireMonths}
              goalManWon={data.fireTargetMan}
              coastManWon={Math.round(data.fireTargetMan * 0.55)}
              radius="hero"
              className="shadow-elevated"
            />
            {isOverTarget ? (
              <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-fb-positive-soft p-3.5 text-[13px] font-medium leading-[1.55] text-fb-positive-ink">
                <span className="shrink-0">🎉</span>
                <span>이미 FIRE 목표 자산을 넘었어요. 목표 월 생활비를 다시 점검해 볼까요?</span>
              </div>
            ) : null}
          </div>

          {/* 2-up secondary metric grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div data-od-id="metric-net-worth">
              <MetricCard
                title="FIRE 계산 순자산"
                value={data.investableMan.toLocaleString('ko-KR')}
                unit="만원"
                size="secondary"
                tone="trust"
              />
            </div>
            <div data-od-id="metric-fire-net-worth">
              <MetricCard
                title="FIRE 목표자산"
                value={data.fireTargetMan.toLocaleString('ko-KR')}
                unit="만원"
                size="secondary"
              />
            </div>
            <div data-od-id="metric-monthly-growth">
              <MetricCard
                title="월 자산 증가 여력"
                value={data.monthlyAddMan.toLocaleString('ko-KR')}
                unit="만원"
                size="secondary"
                tone={data.monthlyAddMan >= 0 ? 'positive' : 'negative'}
              />
            </div>
            <div data-od-id="metric-time-to-fire">
              <MetricCard
                title="FIRE까지"
                value={`${data.fireYears}년 ${data.fireMonths}개월`}
                unit={null}
                size="secondary"
                tone="trust"
              />
            </div>
          </div>

          {/* Cashflow summary */}
          <div data-od-id="cashflow-summary" className="mt-6">
            <CashflowSummary
              incomeMan={data.incomeMan}
              fixedMan={data.fixedMan}
              variableMan={data.variableMan}
              regularInvestmentMan={data.saveMan}
              remainingMan={data.monthlyAddMan}
            />
          </div>

          {/* Checkin card — matches PC dashboard exactly */}
          {showSpouseCard ? (
            <div className="mt-6" data-od-id="checkin-row">
              <Card radius="hero" className="p-5">
                <div className="mb-3 h-[2px] w-6 rounded-[2px] bg-fb-ink" />
                <h3 className="text-[16px] font-bold text-fb-ink">이번 달 부부 체크인</h3>
                <div className="mt-3" data-od-id="spouse-card">
                  <CheckinRow name="나" role="admin" status="done" when="오늘 14:08 입력" />
                  <div className="fb-divider" />
                  <CheckinRow name="배우자" role="lite" status="pending" when="초대 수락 · 입력 대기 중" />
                  <div className="mt-3 rounded-[12px] bg-fb-cautionary-soft p-3 text-[12px] font-medium leading-[1.5] text-fb-cautionary-ink">
                    배우자 체크인이 완료되면 이번 달 결과가 확정돼요.
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {/* Entry cards: subscribe (primary CTA) + assets */}
          <div className="mt-4 flex flex-col gap-2.5">
            <div data-od-id="entry-subscribe">
              <Link
                href="/subscribe"
                className="fbpress flex items-center gap-3.5 rounded-[20px] border border-fb-line bg-white p-5 shadow-soft"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-fb-trust-soft text-fb-trust-ink">
                  <Icon name="refresh" className="size-[22px]" />
                </span>
                <span className="flex-1">
                  <span className="block text-[14px] font-bold text-fb-ink">FIRE 생활비 조정기</span>
                  <span className="mt-0.5 block text-[12px] font-medium text-fb-ink-3">
                    고정비·변동비·여유분으로 권장 목표를 다시 잡기
                  </span>
                </span>
                <Icon name="chevron-right" className="size-5 shrink-0 text-fb-ink-3" />
              </Link>
            </div>
            <div data-od-id="entry-assets">
              <Link
                href="/assets"
                className="fbpress flex items-center gap-3.5 rounded-[20px] border border-fb-line bg-white p-5 shadow-soft"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-fb-card-alt text-fb-ink-2">
                  <Icon name="wallet" className="size-[22px]" />
                </span>
                <span className="flex-1">
                  <span className="block text-[14px] font-bold text-fb-ink">FIRE 자산 진단</span>
                  <span className="mt-0.5 block text-[12px] font-medium text-fb-ink-3">
                    FIRE 반영 = 즉시 투자가능 − 투자성 대출
                  </span>
                </span>
                <Icon name="chevron-right" className="size-5 shrink-0 text-fb-ink-3" />
              </Link>
            </div>
          </div>

          {/* Footer disclaimer */}
          <div className="mt-5 pb-2 text-center text-[11px] font-medium leading-[1.55] text-fb-ink-4">
            25배 룰 · 연 5% 단순 가정의 참고 시뮬레이션이에요. 투자 자문이 아닙니다.
          </div>

          <div className="mt-4">
            <SignOutButton />
          </div>
        </main>

        <div data-od-id="bottom-nav">
          <BottomNav active="home" partnerPending={data.partnerStatus !== 'completed'} />
        </div>
      </MobileAppShell>
    </div>
  )
}

export default DashboardMobilePage
