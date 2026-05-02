import { Card } from './card'
import { cn } from '@/lib/cn'

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
  className?: string
}

export function NetWorthHero({
  targetMonthlyExpenseManWon,
  fireNetWorthManWon,
  monthlyGrowthManWon,
  fireTargetManWon,
  years,
  months,
  className,
}: NetWorthHeroProps) {
  const hasDistance = years != null && months != null

  return (
    <Card radius="hero" className={cn('p-6', className)}>
      <p className="text-[13px] font-medium text-fb-ink-3">예상 FIRE 도달까지</p>
      <div className="fb-num mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[44px] font-bold leading-[1.1] tracking-[-0.024em] text-fb-ink">
          {hasDistance ? `${years}년 ${months}개월` : '계산 대기'}
        </span>
      </div>
      <p className="mt-2 text-[12px] font-medium leading-5 text-fb-ink-3">
        월 {targetMonthlyExpenseManWon.toLocaleString('ko-KR')}만원 생활비 기준 · 연 5%, 25배 룰
      </p>

      <div className="my-5 fb-divider" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <BreakdownItem label="목표 월 생활비" value={targetMonthlyExpenseManWon} />
        <BreakdownItem label="FIRE 목표자산" value={fireTargetManWon} highlight />
        <BreakdownItem label="FIRE 계산 순자산" value={fireNetWorthManWon} highlight badge="FIRE" />
        <BreakdownItem label="월 자산 증가 여력" value={monthlyGrowthManWon} />
      </div>
    </Card>
  )
}

function BreakdownItem({
  label,
  value,
  highlight = false,
  badge,
}: {
  label: string
  value: number
  highlight?: boolean
  badge?: string
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
      <div
        className={cn(
          'fb-num mt-0.5 text-[17px] font-bold',
          highlight ? 'text-fb-trust' : 'text-fb-ink',
        )}
      >
        {value.toLocaleString('ko-KR')}
        <span className="ml-1 text-[12px] font-semibold text-fb-ink-3">만원</span>
      </div>
    </div>
  )
}
