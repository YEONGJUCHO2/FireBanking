import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type PillTone = 'neutral' | 'trust' | 'positive' | 'cautionary' | 'negative' | 'inverse'
type Size = 'sm' | 'md'

const toneClass: Record<PillTone, string> = {
  neutral: 'bg-fb-card-mute text-fb-ink-2',
  trust: 'bg-fb-trust-soft text-fb-trust-ink',
  positive: 'bg-fb-positive-soft text-fb-positive-ink',
  cautionary: 'bg-fb-cautionary-soft text-fb-cautionary-ink',
  negative: 'bg-fb-negative-soft text-fb-negative-ink',
  inverse: 'bg-fb-ink text-white',
}

/** Legacy status names mapped onto new tones (back-compat) */
const legacyToneMap: Record<string, PillTone> = {
  positive: 'positive',
  caution: 'cautionary',
  cautionary: 'cautionary',
  danger: 'negative',
  negative: 'negative',
  unavailable: 'neutral',
  info: 'trust',
  trust: 'trust',
  neutral: 'neutral',
  inverse: 'inverse',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-[22px] px-2 text-[11px]',
  md: 'h-7 px-3 text-[12px]',
}

export function StatusPill({
  label,
  children,
  tone,
  status,
  size = 'md',
  icon,
  className,
}: {
  label?: string
  children?: ReactNode
  tone?: PillTone
  /** Legacy alias — accepts old status names like 'caution', 'info', 'unavailable' */
  status?: string
  size?: Size
  icon?: ReactNode
  className?: string
}) {
  const finalTone: PillTone = tone ?? (status ? (legacyToneMap[status] ?? 'neutral') : 'neutral')
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold tracking-[0.018em]',
        toneClass[finalTone],
        sizeClass[size],
        className,
      )}
    >
      {icon ? <span className="flex items-center">{icon}</span> : null}
      {children ?? label}
    </span>
  )
}

/* Backwards compat: legacy `status="positive|caution|..."` used in older callsites */
const legacyStatusToTone: Record<string, PillTone> = {
  positive: 'positive',
  caution: 'cautionary',
  danger: 'negative',
  unavailable: 'neutral',
  info: 'trust',
}

export function StatusPillLegacy({
  label,
  status = 'info',
  className,
}: {
  label: string
  status?: keyof typeof legacyStatusToTone
  className?: string
}) {
  return <StatusPill label={label} tone={legacyStatusToTone[status]} className={className} />
}
