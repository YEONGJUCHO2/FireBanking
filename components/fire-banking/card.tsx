import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardProps = {
  children: ReactNode
  tone?: 'default' | 'soft' | 'green' | 'warning' | 'danger' | 'muted' | 'sand'
  className?: string
} & HTMLAttributes<HTMLDivElement>

const toneClass = {
  default: 'border-fb-line bg-fb-card text-fb-ink shadow-card',
  soft: 'border-fb-line bg-fb-surface text-fb-ink shadow-card',
  green: 'border-fb-green/20 bg-fb-green text-white shadow-soft',
  warning: 'border-fb-warning/25 bg-fb-warning-bg text-fb-ink shadow-card',
  danger: 'border-fb-danger/25 bg-fb-danger-bg text-fb-ink shadow-card',
  muted: 'border-fb-line bg-fb-stone/60 text-fb-ink shadow-card',
  sand: 'border-fb-line bg-fb-sand/70 text-fb-ink shadow-card',
}

export function Card({ children, tone = 'default', className, ...props }: CardProps) {
  return <div className={cn('rounded-card border', toneClass[tone], className)} {...props}>{children}</div>
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-bold tracking-normal text-fb-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-fb-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
