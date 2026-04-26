import { formatManWon } from '@/lib/format'
import { cn } from '@/lib/cn'
import { Icon } from './icons'

export function CashflowSummary({ incomeMan, livingCostMan, regularInvestmentMan, remainingMan, compact = false }: { incomeMan: number; livingCostMan: number; regularInvestmentMan: number; remainingMan: number; compact?: boolean }) {
  const steps = [
    { label: '세후 월수입', value: incomeMan, sign: '' },
    { label: '월 생활비', value: livingCostMan, sign: '−' },
    { label: '정기저축/투자', value: regularInvestmentMan, sign: '−' },
    { label: '월 자산 증가 여력', value: remainingMan, sign: '=' },
  ]

  return (
    <section className="fb-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-normal text-fb-ink">월 현금흐름 요약</h2>
        <span className="rounded-full bg-fb-green-100 px-3 py-1 text-xs font-bold text-fb-green">비난 없는 점검</span>
      </div>
      <div className={cn('grid gap-2', compact ? 'grid-cols-4' : 'grid-cols-2 md:grid-cols-4')}>
        {steps.map((step, index) => (
          <div key={step.label} className="rounded-soft border border-fb-line bg-fb-surface p-3">
            <p className="text-[11px] font-bold text-fb-muted">{index > 0 ? `${step.sign} ` : ''}{step.label}</p>
            <p className={cn('mt-1 text-lg font-bold tracking-normal', step.value < 0 ? 'text-fb-danger' : 'text-fb-ink')}>{formatManWon(step.value)}</p>
          </div>
        ))}
      </div>
      {remainingMan < 0 ? (
        <div className="mt-4 flex gap-3 rounded-soft bg-fb-danger-bg p-4 text-sm leading-6 text-fb-danger">
          <Icon name="info" className="mt-0.5 size-5 shrink-0" />
          <p>현재 입력 기준으로는 월 자산 증가 여력이 크지 않아요. 이번 달에는 고정비와 자동이체를 함께 살펴보면 충분합니다.</p>
        </div>
      ) : null}
    </section>
  )
}
