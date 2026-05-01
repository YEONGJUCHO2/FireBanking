import { cn } from '@/lib/cn'
import { StatusPill } from './status-pill'

type MetricVariant = 'positive' | 'neutral' | 'caution' | 'danger' | 'unavailable'
type MetricSize = 'sm' | 'md' | 'lg'

const variantText: Record<MetricVariant, string> = {
  positive: 'text-fb-green',
  neutral: 'text-fb-muted',
  caution: 'text-fb-warning',
  danger: 'text-fb-danger',
  unavailable: 'text-fb-subtle',
}

const statusMap = {
  positive: 'positive',
  caution: 'caution',
  danger: 'danger',
  unavailable: 'unavailable',
  neutral: 'info',
} as const

const sizeClass: Record<MetricSize, { value: string; card: string }> = {
  sm: { value: 'text-lg', card: 'p-4' },
  md: { value: 'text-xl', card: 'p-5' },
  lg: { value: 'text-3xl', card: 'p-6' },
}

export function MetricCard({ title, value, caption, delta, variant = 'neutral', size = 'md', className, statusLabel }: { title: string; value: string; caption?: string; delta?: string; variant?: MetricVariant; size?: MetricSize; className?: string; statusLabel?: string }) {
  return (
    <section className={cn('fb-card', sizeClass[size].card, className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold tracking-[-0.01em] text-fb-muted">{title}</p>
        {statusLabel ? <StatusPill label={statusLabel} status={statusMap[variant]} /> : null}
      </div>
      <p className={cn('mt-2 whitespace-nowrap font-bold tracking-[-0.06em] text-fb-ink', sizeClass[size].value)}>{value}</p>
      {delta ? <p className={cn('mt-2 text-xs font-bold', variantText[variant])}>{delta}</p> : null}
      {caption ? <p className="mt-2 text-xs leading-5 text-fb-muted">{caption}</p> : null}
    </section>
  )
}

export function StateMetricExamples() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard title="정상" value="3억 7,450만원" delta="전월 대비 +320만원" variant="positive" size="sm" />
      <MetricCard title="주의" value="1억 2,300만원" delta="전월 대비 -150만원" variant="caution" size="sm" />
      <MetricCard title="계산 불가" value="—" caption="계산할 수 없음" variant="unavailable" size="sm" />
    </div>
  )
}
