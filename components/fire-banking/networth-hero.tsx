'use client'

import Link from 'next/link'
import { Card } from './card'
import { cn } from '@/lib/cn'
import type { FireDisplayMode } from './fire-timeline'

type NetWorthHeroProps = {
  /** 목표 월 생활비 (만원) */
  targetMonthlyExpenseManWon: number
  /** FIRE 계산 순자산 (만원) */
  fireNetWorthManWon: number
  /** 월 자산 증가 여력 (만원) */
  monthlyGrowthManWon: number
  /** FIRE 목표 자산 (만원): 목표 월 생활비 × 12 × 25 */
  fireTargetManWon: number
  years?: number
  months?: number
  displayMode?: FireDisplayMode
  onDisplayModeChange?: (mode: FireDisplayMode) => void
  className?: string
}

export function NetWorthHero({
  targetMonthlyExpenseManWon,
  fireNetWorthManWon,
  monthlyGrowthManWon,
  fireTargetManWon,
  years,
  months,
  displayMode = 'amount',
  onDisplayModeChange,
  className,
}: NetWorthHeroProps) {
  const hasDistance = years != null && months != null
  const remainingManWon = Math.max(0, fireTargetManWon - fireNetWorthManWon)
  const heroLabel = displayMode === 'amount' ? 'FIRE까지 남은 금액' : 'FIRE까지 남은 기간'
  const heroValue =
    displayMode === 'amount'
      ? remainingManWon.toLocaleString('ko-KR')
      : hasDistance
        ? `${years}년 ${months}개월`
        : '계산 대기'

  return (
    <Card radius="hero" className={cn('p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-fb-ink-3">{heroLabel}</p>
        <div className="flex rounded-full border border-fb-line bg-white p-1">
          {(['amount', 'period'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDisplayModeChange?.(mode)}
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
      <div className="fb-num mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[44px] font-bold leading-[1.1] tracking-[-0.024em] text-fb-ink">
          {heroValue}
        </span>
        {displayMode === 'amount' ? <span className="text-[18px] font-bold text-fb-ink-2">만원</span> : null}
      </div>
      <p className="mt-2 text-[12px] font-medium leading-5 text-fb-ink-3">
        월 {targetMonthlyExpenseManWon.toLocaleString('ko-KR')}만원 생활비 기준 · 연 5%, 25배 룰
      </p>

      <div className="my-5 fb-divider" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <BreakdownItem label="목표 월 생활비" value={targetMonthlyExpenseManWon} />
        <BreakdownItem label="FIRE 목표자산" value={fireTargetManWon} highlight />
        <BreakdownItem label="FIRE 계산 순자산" value={fireNetWorthManWon} highlight badge="FIRE" />
        <BreakdownItem
          label="월 자산 증가 여력"
          value={monthlyGrowthManWon}
          action={
            <Link
              href="/subscribe"
              className="fbpress inline-flex h-7 shrink-0 items-center rounded-[10px] border border-fb-line bg-white px-2.5 text-[11px] font-bold text-fb-trust hover:bg-fb-trust-soft hover:border-fb-trust/30"
            >
              계산하기
            </Link>
          }
        />
      </div>
    </Card>
  )
}

function BreakdownItem({
  label,
  value,
  highlight = false,
  badge,
  action,
}: {
  label: string
  value: number
  highlight?: boolean
  badge?: string
  action?: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[12px] font-medium text-fb-ink-3">
        {label}
        {badge ? (
          <span className="rounded-[4px] bg-fb-trust-soft px-1.5 py-px text-[10px] font-bold text-fb-trust-ink">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <div
          className={cn(
            'fb-num text-[17px] font-bold',
            highlight ? 'text-fb-trust' : 'text-fb-ink',
          )}
        >
          {value.toLocaleString('ko-KR')}
          <span className="ml-1 text-[12px] font-semibold text-fb-ink-3">만원</span>
        </div>
        {action}
      </div>
    </div>
  )
}
