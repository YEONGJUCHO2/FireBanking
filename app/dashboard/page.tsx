import Link from 'next/link'
import {
  BottomNav,
  CashflowSummary,
  DesktopDashboard,
  FireHeroCard,
  InviteCard,
  MobileAppShell,
  NetWorthHero,
  ScreenTopBar,
  StatusPill,
} from '@/components/fire-banking'
import { Card, SectionHeader } from '@/components/fire-banking/card'
import { CheckinRow } from '@/components/fire-banking/checkin-row'
import { Icon } from '@/components/fire-banking/icons'
import { SignOutButton } from '@/src/features/auth/components/SignOutButton'

const data = {
  totalNetWorthMan: 51_500,
  netWorthDeltaMan: 320,
  homeMan: 38_000,
  investableMan: 13_500,
  otherMan: 1_500,
  fireTargetMan: 40_000,
  incomeMan: 850,
  fixedMan: 350,
  variableMan: 220,
  saveMan: 180,
  monthlyAddMan: 280,
  fireYears: 8,
  fireMonths: 4,
}

export default function DashboardPage() {
  const percent = Math.max(0, Math.min(1, data.investableMan / data.fireTargetMan))

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden">
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

          <main className="flex-1 overflow-auto px-4 pb-8 pt-5">
            {/* month banner */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
                  2026. 04. 체크인
                </div>
                <div className="mt-0.5 text-[18px] font-bold tracking-[-0.012em] text-fb-ink">
                  안녕하세요, 지윤님
                </div>
              </div>
              <StatusPill
                tone="trust"
                icon={<span className="size-1.5 rounded-full bg-fb-trust" />}
              >
                이번 달 진행 중
              </StatusPill>
            </div>

            <NetWorthHero
              totalManWon={data.totalNetWorthMan}
              deltaManWon={data.netWorthDeltaMan}
              homeManWon={data.homeMan}
              investableManWon={data.investableMan}
              otherManWon={data.otherMan}
              fireTargetManWon={data.fireTargetMan}
            />

            <div className="mt-4">
              <FireHeroCard
                percent={percent}
                years={data.fireYears}
                months={data.fireMonths}
                goalManWon={data.fireTargetMan}
                coastManWon={Math.round(data.fireTargetMan * 0.55)}
              />
            </div>

            <section className="mt-6 space-y-3">
              <SectionHeader
                title="이번 달 부부 체크인"
                subtitle="배우자 입력이 끝나면 결과가 확정돼요"
              />
              <Card className="px-4 py-1">
                <CheckinRow name="지윤" role="admin" status="done" when="오늘 14:08 입력" />
                <div className="fb-divider" />
                <CheckinRow
                  name="민호"
                  role="lite"
                  status="pending"
                  when="초대 수락 · 입력 대기 중"
                />
              </Card>
            </section>

            <div className="mt-6">
              <CashflowSummary
                incomeMan={data.incomeMan}
                fixedMan={data.fixedMan}
                variableMan={data.variableMan}
                regularInvestmentMan={data.saveMan}
                remainingMan={data.monthlyAddMan}
              />
            </div>

            <section className="mt-6 space-y-3">
              <SectionHeader title="배우자 초대" />
              <InviteCard />
            </section>

            <Link
              href="/subscribe"
              className="fbpress mt-4 flex items-center gap-3.5 rounded-[20px] border border-fb-line bg-white p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-[14px] bg-fb-trust-soft text-fb-trust-ink">
                <Icon name="refresh" className="size-[22px]" />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-bold text-fb-ink">고정비 시뮬레이터</span>
                <span className="mt-0.5 block text-[12px] font-medium text-fb-ink-3">
                  반복 지출이 미래 자산에 미치는 영향
                </span>
              </span>
              <Icon name="chevron-right" className="size-5 text-fb-ink-3" />
            </Link>

            <div className="mt-6">
              <SignOutButton />
            </div>
          </main>

          <BottomNav active="home" partnerPending />
        </MobileAppShell>
      </div>

      {/* DESKTOP */}
      <div className="hidden min-h-dvh bg-fb-page px-8 py-10 lg:block">
        <DesktopDashboard footerAction={<SignOutButton />} />
      </div>
    </>
  )
}
