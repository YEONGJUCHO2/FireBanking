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
    <label className={cn('block', className)}>
      <div className="mb-2 flex items-end justify-between gap-3">
        <span className="text-sm font-bold tracking-normal text-fb-ink">{label}</span>
        {helper ? <span className="hidden text-right text-[11px] font-medium text-fb-muted sm:block">{helper}</span> : null}
      </div>
      <div className="relative">
        <input
          name={name}
          inputMode="numeric"
          defaultValue={value === undefined ? undefined : formatNumber(value)}
          placeholder={placeholder}
          className={cn('fb-input h-12 px-4 pr-14 text-right text-[15px]', soft && 'bg-fb-green-50/45')}
          aria-label={label}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-fb-muted">{unit}</span>
      </div>
      {helper ? <span className="mt-1.5 block text-xs leading-5 text-fb-muted sm:hidden">{helper}</span> : null}
    </label>
  )
}

export function TextField({ label, value, placeholder, helper, className }: { label: string; value?: string; placeholder?: string; helper?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-sm font-bold tracking-normal text-fb-ink">{label}</span>
      <input defaultValue={value} placeholder={placeholder} className="fb-input h-12 px-4" />
      {helper ? <span className="mt-2 block text-xs font-medium text-fb-muted">{helper}</span> : null}
    </label>
  )
}
