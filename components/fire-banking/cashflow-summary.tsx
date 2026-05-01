import { Card, SectionHeader } from './card'
import { Icon } from './icons'
import { cn } from '@/lib/cn'

type CashflowItem = {
  label: string
  /** 만원, signed (positive = income, negative = outflow) */
  value: number
  tone?: 'normal' | 'positive' | 'trust'
}

export function CashflowSummary({
  incomeMan,
  livingCostMan,
  regularInvestmentMan,
  fixedMan,
  variableMan,
  remainingMan,
  compact = false,
}: {
  incomeMan: number
  /** mobile-style breakdown: pass either livingCostMan, or fixedMan + variableMan */
  livingCostMan?: number
  fixedMan?: number
  variableMan?: number
  regularInvestmentMan: number
  remainingMan: number
  compact?: boolean
}) {
  const items: CashflowItem[] = [
    { label: '월 세후 수입', value: incomeMan, tone: 'positive' },
    ...(fixedMan != null && variableMan != null
      ? [
          { label: '고정비', value: -fixedMan },
          { label: '변동비', value: -variableMan },
        ]
      : livingCostMan != null
        ? [{ label: '월 생활비', value: -livingCostMan }]
        : []),
    { label: '저축 / 투자', value: -regularInvestmentMan, tone: 'trust' },
  ]

  return (
    <section className="space-y-3">
      <SectionHeader title="이번 달 현금흐름" subtitle="고정비를 지나도 남는 돈이 자산 증가 여력이에요" />
      <Card className={cn('p-5', compact && 'p-4')}>
        <div className="flex flex-col gap-3.5">
          {items.map((item) => (
            <Row key={item.label} {...item} />
          ))}
          <div className="fb-divider" />
          <Row
            label="자산 증가 여력"
            value={remainingMan}
            hero
            tone={remainingMan >= 0 ? 'trust' : 'normal'}
          />
          {remainingMan < 0 ? (
            <div className="flex items-start gap-2 rounded-[12px] bg-fb-cautionary-soft p-3.5 text-[13px] font-medium leading-[1.55] text-fb-cautionary-ink">
              <Icon name="info" className="mt-0.5 size-[18px] shrink-0" />
              <span>이번 달은 고정비·변동비 합이 수입을 살짝 넘었어요. 다음 달 고정비를 같이 살펴볼까요?</span>
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  )
}

function Row({
  label,
  value,
  tone = 'normal',
  hero = false,
}: CashflowItem & { hero?: boolean }) {
  const colorClass =
    tone === 'positive'
      ? 'text-fb-positive'
      : tone === 'trust'
        ? 'text-fb-trust'
        : value < 0 && hero
          ? 'text-fb-negative'
          : 'text-fb-ink'

  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const abs = Math.abs(value).toLocaleString('ko-KR')

  return (
    <div className="flex items-baseline justify-between">
      <span
        className={cn(
          'tracking-[-0.004em]',
          hero ? 'text-[14px] font-bold text-fb-ink' : 'text-[13px] font-medium text-fb-ink-2',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'fb-num tracking-[-0.012em]',
          hero ? 'text-[22px] font-bold' : 'text-[15px] font-semibold',
          hero ? colorClass : value < 0 ? 'text-fb-ink' : colorClass,
        )}
      >
        {sign}
        {abs}
        <span className={cn('ml-1 font-semibold text-fb-ink-3', hero ? 'text-[12px]' : 'text-[11px]')}>
          만원
        </span>
      </span>
    </div>
  )
}
