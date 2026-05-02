import { Card } from './card'
import { cn } from '@/lib/cn'

type NetWorthHeroProps = {
  /** 표시 순자산 (만원) */
  totalManWon: number
  /** 전월 대비 Δ (만원, signed) */
  deltaManWon?: number
  /** 거주 부동산 (만원) */
  homeManWon: number
  /** 투자가능 — FIRE 계산 (만원) */
  investableManWon: number
  /** 기타 자산 (만원) */
  otherManWon: number
  /** FIRE 계산에서 제외하는 연금/IRP 자산 (만원) */
  retirementManWon?: number
  /** FIRE 목표 자산 (만원) */
  fireTargetManWon: number
  className?: string
}

export function NetWorthHero({
  totalManWon,
  deltaManWon,
  homeManWon,
  investableManWon,
  otherManWon,
  retirementManWon = 0,
  fireTargetManWon,
  className,
}: NetWorthHeroProps) {
  return (
    <Card radius="hero" className={cn('p-6', className)}>
      <p className="text-[13px] font-medium text-fb-ink-3">우리 가족 표시 순자산</p>
      <div className="fb-num mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[44px] font-bold leading-[1.1] tracking-[-0.024em] text-fb-ink">
          {totalManWon.toLocaleString('ko-KR')}
        </span>
        <span className="text-[18px] font-bold text-fb-ink-2">만원</span>
      </div>
      {deltaManWon != null ? (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'fb-num text-[13px] font-semibold',
              deltaManWon >= 0 ? 'text-fb-positive' : 'text-fb-negative',
            )}
          >
            {deltaManWon >= 0 ? '↑' : '↓'} {Math.abs(deltaManWon).toLocaleString('ko-KR')}만원
          </span>
          <span className="text-[12px] font-medium text-fb-ink-3">지난 달 대비</span>
        </div>
      ) : null}

      <div className="my-5 fb-divider" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <BreakdownItem label="거주 부동산" value={homeManWon} />
        <BreakdownItem label="투자가능" value={investableManWon} highlight badge="FIRE" />
        <BreakdownItem
          label={retirementManWon > 0 ? "연금/IRP 별도" : "기타 순자산"}
          value={retirementManWon > 0 ? retirementManWon : otherManWon}
        />
        <BreakdownItem label="FIRE 목표" value={fireTargetManWon} />
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
