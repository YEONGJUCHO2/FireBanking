import { cn } from '@/lib/cn'

type Status = 'positive' | 'caution' | 'danger' | 'unavailable' | 'info'

const tone: Record<Status, string> = {
  positive: 'bg-fb-green-100 text-fb-green',
  caution: 'bg-fb-warning-bg text-fb-warning',
  danger: 'bg-fb-danger-bg text-fb-danger',
  unavailable: 'bg-fb-stone text-fb-muted',
  info: 'bg-fb-green-50 text-fb-green',
}

export function StatusPill({ label, status = 'info', className }: { label: string; status?: Status; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-[-0.01em]', tone[status], className)}>
      {label}
    </span>
  )
}
