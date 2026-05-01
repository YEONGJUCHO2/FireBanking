import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'

type MoneyInputRowProps = {
  label: string
  value?: number
  placeholder?: string
  helper?: string
  unit?: string
  className?: string
  name?: string
  soft?: boolean
}

export function MoneyInputRow({ label, value, placeholder = '0', helper, unit = '만원', className, name, soft = false }: MoneyInputRowProps) {
  return (
    <label className={cn('block py-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-bold tracking-[-0.02em] text-fb-ink">{label}</span>
        <div className="relative w-[148px] shrink-0">
          <input
            name={name}
            inputMode="numeric"
            defaultValue={value === undefined ? undefined : formatNumber(value)}
            placeholder={placeholder}
            className={cn('fb-input h-10 px-3 pr-12 text-right text-[14px]', soft && 'bg-fb-green-50/45')}
            aria-label={label}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-fb-muted">{unit}</span>
        </div>
      </div>
      {helper ? <span className="mt-1 block text-[11px] leading-4 text-fb-muted">{helper}</span> : null}
    </label>
  )
}

export function TextField({ label, value, placeholder, helper, className }: { label: string; value?: string; placeholder?: string; helper?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-sm font-bold tracking-[-0.02em] text-fb-ink">{label}</span>
      <input defaultValue={value} placeholder={placeholder} className="fb-input h-12 px-4" />
      {helper ? <span className="mt-2 block text-xs font-medium text-fb-muted">{helper}</span> : null}
    </label>
  )
}
