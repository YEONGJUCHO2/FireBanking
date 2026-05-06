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
    <Card radius="hero" className={cn('relative p-6', className)}>
      <div className="absolute right-6 top-6 flex rounded-full border border-fb-line bg-white p-1">
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
      <p className="text-[13px] font-medium leading-none text-fb-ink-3">{heroLabel}</p>
      <div className="fb-num mt-1 flex items-baseline gap-1.5">
        <span className="text-[44px] font-bold leading-[1.1] tracking-[-0.024em] text-fb-trust">
          {heroValue}
        </span>
        {displayMode === 'amount' ? <span className="text-[18px] font-bold text-fb-ink-2">만원</span> : null}
      </div>
      <p className="mt-2 text-[12px] font-medium leading-5 text-fb-ink-3">
        월 {targetMonthlyExpenseManWon.toLocaleString('ko-KR')}만원 생활비 기준 · 연 5%, 25배 룰
      </p>

      <div className="my-5 fb-divider" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <BreakdownItem label="목표 금액" value={fireTargetManWon} />
        <BreakdownItem label="FIRE 후 생활비" value={targetMonthlyExpenseManWon} monthly />
        <BreakdownItem
          label="FIRE 계산 순자산"
          value={fireNetWorthManWon}
          href="/assets"
          srHint="자산 진단 열기"
        />
        <BreakdownItem
          label="모이는 돈"
          value={monthlyGrowthManWon}
          monthly
          href="/subscribe"
          srHint="생활비 조정기 열기"
        />
      </div>
    </Card>
  )
}

function BreakdownItem({
  label,
  value,
  monthly,
  href,
  srHint,
}: {
  label: string
  value: number
  monthly?: boolean
  href?: string
  srHint?: string
}) {
  const valueRow = (
    <div className="mt-0.5 flex items-baseline gap-1">
      {monthly ? <span className="text-[12px] font-semibold text-fb-ink-3">월</span> : null}
      <span className="fb-num text-[17px] font-bold text-fb-ink">
        {value.toLocaleString('ko-KR')}
      </span>
      <span className="text-[12px] font-semibold text-fb-ink-3">만원</span>
    </div>
  )

  const labelRow = (
    <div className="flex items-center gap-1.5 text-[12px] font-medium text-fb-ink-3">
      {href ? <span aria-hidden className="size-1.5 rounded-full bg-fb-trust" /> : null}
      {label}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group fb-focus -m-1 block rounded-[10px] p-1 transition-colors hover:bg-fb-card-alt"
      >
        {labelRow}
        {valueRow}
        {srHint ? <span className="sr-only">— {srHint}</span> : null}
      </Link>
    )
  }

  return (
    <div>
      {labelRow}
      {valueRow}
    </div>
  )
}
