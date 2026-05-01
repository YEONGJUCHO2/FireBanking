import { cn } from '@/lib/cn'

export function BrandMark({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dim = size === 'sm' ? 'size-7 text-[12px]' : size === 'lg' ? 'size-9 text-[15px]' : 'size-8 text-[13px]'
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[10px] bg-fb-ink font-extrabold tracking-[-0.024em] text-white',
        dim,
        className,
      )}
    >
      FB
    </span>
  )
}

export function BrandLockup({
  compact = false,
  tagline = false,
  className,
}: {
  compact?: boolean
  tagline?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={compact ? 'sm' : 'md'} />
      <div className="leading-none">
        <p
          className={cn(
            'font-bold tracking-[-0.012em] text-fb-ink',
            compact ? 'text-[14px]' : 'text-[16px]',
          )}
        >
          Fire Banking
        </p>
        {tagline ? (
          <p className="mt-1 text-[12px] font-medium text-fb-ink-3">월 1회 부부 재무 체크인</p>
        ) : null}
      </div>
    </div>
  )
}

/* Backwards-compat alias for any older imports */
export const LeafLogo = BrandMark
