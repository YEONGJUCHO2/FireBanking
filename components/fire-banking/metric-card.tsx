import { cn } from '@/lib/cn'

type MetricTone = 'normal' | 'trust' | 'positive' | 'negative' | 'muted'
/** 'sm'/'md'/'lg' are legacy aliases for secondary/primary/hero. */
type MetricSize = 'hero' | 'primary' | 'secondary' | 'sm' | 'md' | 'lg'

const toneClass: Record<MetricTone, string> = {
  normal: 'text-fb-ink',
  trust: 'text-fb-trust',
  positive: 'text-fb-positive',
  negative: 'text-fb-negative',
  muted: 'text-fb-ink-3',
}

const sizeClass: Record<MetricSize, { value: string; unit: string }> = {
  hero: { value: 'text-[44px] font-bold tracking-[-0.024em] leading-[1.15]', unit: 'text-[18px] font-bold' },
  lg: { value: 'text-[44px] font-bold tracking-[-0.024em] leading-[1.15]', unit: 'text-[18px] font-bold' },
  primary: { value: 'text-[28px] font-bold tracking-[-0.020em] leading-[1.2]', unit: 'text-[14px] font-semibold' },
  md: { value: 'text-[28px] font-bold tracking-[-0.020em] leading-[1.2]', unit: 'text-[14px] font-semibold' },
  secondary: { value: 'text-[20px] font-bold tracking-[-0.012em] leading-[1.3]', unit: 'text-[12px] font-semibold' },
  sm: { value: 'text-[20px] font-bold tracking-[-0.012em] leading-[1.3]', unit: 'text-[12px] font-semibold' },
}

type MetricCardProps = {
  title?: string
  /** legacy alias for title */
  label?: string
  value: string
  unit?: string | null
  caption?: string
  delta?: number | string | null
  tone?: MetricTone
  size?: MetricSize
  className?: string
  /** legacy props for backwards compat — mapped onto tone */
  variant?: 'positive' | 'neutral' | 'caution' | 'danger' | 'unavailable'
  statusLabel?: string
}

const legacyVariantToTone: Record<NonNullable<MetricCardProps['variant']>, MetricTone> = {
  positive: 'positive',
  neutral: 'normal',
  caution: 'normal',
  danger: 'negative',
  unavailable: 'muted',
}

export function MetricCard({
  title,
  label,
  value,
  unit = '만원',
  caption,
  delta,
  tone,
  size = 'primary',
  variant,
  className,
}: MetricCardProps) {
  const heading = title ?? label ?? ''
  const finalTone = tone ?? (variant ? legacyVariantToTone[variant] : 'normal')
  const sz = sizeClass[size]

  return (
    <section
      className={cn(
        'rounded-[20px] border border-fb-line bg-fb-card p-5',
        className,
      )}
    >
      <p className="text-[13px] font-medium tracking-[0.014em] text-fb-ink-3">{heading}</p>
      <div className="fb-num mt-1.5 flex items-baseline gap-1">
        <span className={cn(sz.value, toneClass[finalTone])}>{value}</span>
        {unit ? <span className={cn(sz.unit, 'text-fb-ink-2')}>{unit}</span> : null}
      </div>
      {caption ? <p className="mt-1 text-[13px] font-medium text-fb-ink-3">{caption}</p> : null}
      {delta != null ? <DeltaLine delta={delta} /> : null}
    </section>
  )
}

function DeltaLine({ delta }: { delta: number | string }) {
  if (typeof delta === 'string') {
    return <p className="mt-1.5 text-[13px] font-semibold text-fb-positive">{delta}</p>
  }
  const positive = delta >= 0
  return (
    <p
      className={cn(
        'fb-num mt-1.5 text-[13px] font-semibold',
        positive ? 'text-fb-positive' : 'text-fb-negative',
      )}
    >
      {positive ? '↑' : '↓'} {Math.abs(delta).toLocaleString('ko-KR')} 만원
    </p>
  )
}

export function StateMetricExamples() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard title="정상" value="37,450" delta={320} size="secondary" />
      <MetricCard title="주의" value="12,300" delta={-150} size="secondary" />
      <MetricCard title="계산 불가" value="—" unit={null} caption="계산할 수 없음" tone="muted" size="secondary" />
    </div>
  )
}
