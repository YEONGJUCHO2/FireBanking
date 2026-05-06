'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { BrandMark } from './brand'
import { Button } from './button'
import { Card } from './card'
import { CheckinRow } from './checkin-row'
import { FireTimelineWide, type FireDisplayMode } from './fire-timeline'
import { Icon } from './icons'
import { cn } from '@/lib/cn'
import { formatCheckinMonthLabel, formatWorkspaceMonthLabel } from '@/src/lib/checkinDate'

const data = {
  totalNetWorthMan: 51_500,
  netDeltaMan: 320,
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
}

type DesktopDashboardData = typeof data

const navItems = [
  { label: '대시보드', href: '/dashboard' },
  { label: '히스토리', href: '/history' },
] as const

export function DesktopDashboard({
  footerAction,
  data: dashboardData = data,
  avatar,
}: {
  footerAction?: ReactNode
  data?: DesktopDashboardData
  avatar?: { url?: string | null; initial?: string; alt?: string }
}) {
  const percent = Math.max(0, Math.min(1, dashboardData.investableMan / dashboardData.fireTargetMan))
  const [displayMode, setDisplayMode] = useState<FireDisplayMode>('amount')
  const remainingManWon = Math.max(0, dashboardData.fireTargetMan - dashboardData.investableMan)

  return (
    <section
      className="mx-auto w-full max-w-[1200px]"
      data-screen-label="dashboard-desktop"
    >
      {/* top navigation */}
      <header className="flex h-16 items-center justify-between rounded-t-[28px] border border-fb-line bg-white/85 px-8 backdrop-blur">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" />
            <span className="text-[15px] font-bold text-fb-ink">Fire Banking</span>
          </div>
          <nav className="ml-4 flex gap-1">
            {navItems.map(({ label, href }, i) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex h-9 items-center rounded-full px-3.5 text-[13px] font-semibold',
                  i === 0
                    ? 'bg-fb-ink text-white'
                    : 'text-fb-ink-2 hover:bg-fb-card-alt hover:text-fb-ink',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-fb-ink-3">
            {formatCheckinMonthLabel()} 진행 중
          </span>
          <Link
            href="/settings"
            aria-label="설정"
            data-od-id="nav-settings"
            className="fbpress flex size-9 items-center justify-center rounded-full text-fb-ink-2 hover:bg-fb-card-alt hover:text-fb-ink"
          >
            <Icon name="settings" className="size-[18px]" />
          </Link>
          {avatar?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar.url}
              alt={avatar.alt ?? '내 프로필'}
              referrerPolicy="no-referrer"
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-fb-ink text-[12px] font-bold text-white">
              {avatar?.initial ?? '나'}
            </span>
          )}
          {footerAction}
        </div>
      </header>

      <div className="rounded-b-[28px] border-x border-b border-fb-line bg-white px-12 py-8">
        {/* page header */}
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
              {formatWorkspaceMonthLabel()}
            </div>
            <h1 className="mt-1.5 text-[28px] font-bold tracking-[-0.024em] text-fb-ink">
              이번 달 결과를 같이 봐요.
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" iconLeft={<Icon name="share" className="size-[18px]" />}>
              결과 공유
            </Button>
          </div>
        </div>

        {/* 2-column main grid: 1.6fr | 1fr */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          {/* LEFT column */}
          <div className="flex flex-col gap-5">
            {/* Hero: FIRE-centric net worth */}
            <div data-od-id="hero-fire">
              <Card radius="hero" className="p-8">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-medium text-fb-ink-3">
                    {displayMode === 'amount' ? 'FIRE까지 남은 금액' : 'FIRE까지 남은 기간'}
                  </p>
                  <div className="flex rounded-full border border-fb-line bg-white p-1">
                    {(['amount', 'period'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDisplayMode(mode)}
                        className={cn(
                          'h-8 rounded-full px-3 text-[12px] font-bold transition-colors',
                          displayMode === mode ? 'bg-fb-ink text-white' : 'text-fb-ink-2 hover:bg-fb-card-alt',
                        )}
                      >
                        {mode === 'amount' ? '금액' : '기간'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="fb-num mt-2 flex items-baseline gap-1.5">
                  <span className="text-[48px] font-bold leading-none tracking-[-0.030em] text-fb-ink">
                    {displayMode === 'amount'
                      ? remainingManWon.toLocaleString('ko-KR')
                      : `${dashboardData.fireYears}년 ${dashboardData.fireMonths}개월`}
                  </span>
                  {displayMode === 'amount' ? (
                    <span className="text-[22px] font-bold text-fb-ink-2">만원</span>
                  ) : null}
                </div>
                <p className="mt-2 text-[12px] font-medium leading-5 text-fb-ink-3">
                  월 {dashboardData.targetMonthlyExpenseMan.toLocaleString('ko-KR')}만원 생활비 기준 · 연 5%, 25배 룰
                </p>

                {/* 4-column FIRE breakdown */}
                <div className="mt-7 grid grid-cols-4 gap-5 border-t border-fb-line pt-6">
                  <HeroStat label="목표 월 생활비" value={dashboardData.targetMonthlyExpenseMan} />
                  <HeroStat label="FIRE 목표자산" value={dashboardData.fireTargetMan} muted />
                  <div data-od-id="metric-fire-net-worth">
                    <HeroStat label="FIRE 계산 순자산" value={dashboardData.investableMan} highlight />
                  </div>
                  <div data-od-id="metric-monthly-growth">
                    <HeroStat label="월 자산 증가 여력" value={dashboardData.monthlyAddMan} />
                  </div>
                </div>
              </Card>
            </div>

            {/* FIRE timeline card */}
            <div data-od-id="fire-timeline" className="flex flex-1">
              <Card radius="hero" className="flex w-full flex-col p-7">
                <div className="mb-5 flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
                      FIRE까지 남은 거리
                    </div>
                    <h3 className="mt-1.5 text-[20px] font-bold tracking-[-0.012em] text-fb-ink">
                      현재 입력 기준 시뮬레이션
                    </h3>
                  </div>
                </div>

                <FireTimelineWide
                  percent={percent}
                  years={dashboardData.fireYears}
                  months={dashboardData.fireMonths}
                  fireValueManWon={dashboardData.fireTargetMan}
                  hereValueManWon={dashboardData.investableMan}
                  displayMode={displayMode}
                />
              </Card>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-5">
            {/* couple check-in card — always shown; content reflects partner state */}
            <div data-od-id="checkin-row">
              <Card radius="hero" className="p-6">
                <div className="mb-3 h-[2px] w-6 rounded-[2px] bg-fb-ink" />
                <h3 className="text-[17px] font-bold text-fb-ink">이번 달 부부 체크인</h3>
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

            {/* cashflow card */}
            <div data-od-id="cashflow-summary" className="flex flex-1">
              <Card radius="hero" className="flex w-full flex-col p-6">
                <div className="mb-3 h-[2px] w-6 rounded-[2px] bg-fb-ink" />
                <h3 className="text-[17px] font-bold text-fb-ink">이번 달 현금흐름</h3>
                <div className="mt-4 flex flex-col gap-3">
                  <CFRow label="월 세후 수입" value={`+${dashboardData.incomeMan}`} />
                  <CFRow label="고정비" value={`−${dashboardData.fixedMan}`} />
                  <CFRow label="변동비" value={`−${dashboardData.variableMan}`} />
                  <CFRow label="저축 / 투자" value={`−${dashboardData.saveMan}`} trust />
                  <div className="fb-divider" />
                  <CFRow label="자산 증가 여력" value={`+${dashboardData.monthlyAddMan}`} hero />
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

function HeroStat({
  label,
  value,
  highlight,
  muted,
}: {
  label: string
  value: number
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div>
      <div className="text-[12px] font-medium text-fb-ink-3">{label}</div>
      <div
        className={cn(
          'fb-num mt-1 text-[22px] font-bold tracking-[-0.012em]',
          highlight ? 'text-fb-trust' : muted ? 'text-fb-ink-2' : 'text-fb-ink',
        )}
      >
        {value.toLocaleString('ko-KR')}
        <span className="ml-1 text-[12px] font-semibold text-fb-ink-3">만원</span>
      </div>
    </div>
  )
}

function CFRow({
  label,
  value,
  trust,
  hero,
}: {
  label: string
  value: string
  trust?: boolean
  hero?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={cn(
          hero ? 'text-[14px] font-bold text-fb-ink' : 'text-[13px] font-medium text-fb-ink-2',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'fb-num font-bold tracking-[-0.008em]',
          hero ? 'text-[22px] text-fb-trust' : trust ? 'text-[14px] text-fb-trust' : 'text-[14px] text-fb-ink',
        )}
      >
        {value}
        <span className="ml-1 text-[11px] font-semibold text-fb-ink-3">만원</span>
      </span>
    </div>
  )
}
