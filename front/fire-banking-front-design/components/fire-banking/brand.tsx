import { cn } from '@/lib/cn'
import { Icon } from './icons'

export function LeafLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex size-10 items-center justify-center rounded-full bg-fb-green-100 text-fb-green', className)} aria-hidden="true">
      <Icon name="leaf" className="size-5" />
    </span>
  )
}

export function BrandLockup({ compact = false, tagline = true }: { compact?: boolean; tagline?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LeafLogo className={compact ? 'size-8' : undefined} />
      <div>
        <p className={cn('font-semibold tracking-[-0.035em] text-fb-green-900', compact ? 'text-lg' : 'text-2xl')}>Fire Banking</p>
        {tagline && !compact ? <p className="mt-0.5 text-xs font-medium text-fb-muted">부부가 함께 보는 월간 FIRE 체크인</p> : null}
      </div>
    </div>
  )
}
