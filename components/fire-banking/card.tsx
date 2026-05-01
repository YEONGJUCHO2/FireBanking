import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardTone = 'default' | 'alt' | 'inverse' | 'cautionary' | 'positive' | 'trust'

type CardProps = {
  children: ReactNode
  tone?: CardTone
  radius?: 'card' | 'hero'
  className?: string
} & HTMLAttributes<HTMLDivElement>

const toneClass: Record<CardTone, string> = {
  default: 'border-fb-line bg-fb-card text-fb-ink',
  alt: 'border-fb-line bg-fb-card-alt text-fb-ink',
  inverse: 'border-fb-ink bg-fb-ink text-white',
  cautionary: 'border-fb-cautionary/20 bg-fb-cautionary-soft text-fb-cautionary-ink',
  positive: 'border-fb-positive/20 bg-fb-positive-soft text-fb-positive-ink',
  trust: 'border-fb-trust-soft bg-fb-trust-soft text-fb-trust-ink',
}

export function Card({ children, tone = 'default', radius = 'card', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'border',
        radius === 'hero' ? 'rounded-[24px]' : 'rounded-[20px]',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div>
      <div className="mb-3 h-[2px] w-6 rounded-[2px] bg-fb-ink" />
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[18px] font-bold leading-tight tracking-[-0.012em] text-fb-ink">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {subtitle ? <p className="mt-1 text-[13px] font-medium text-fb-ink-3">{subtitle}</p> : null}
    </div>
  )
}

/* Backwards compat alias used in older imports */
export const SectionTitle = SectionHeader
