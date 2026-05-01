'use client'

import { useState, type ChangeEvent } from 'react'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'

type MoneyInputRowProps = {
  label: string
  value?: number
  defaultValue?: number
  placeholder?: string
  helper?: string
  hint?: string
  unit?: string
  className?: string
  name?: string
  optional?: boolean
  autoFocus?: boolean
  onValueChange?: (value: number | '') => void
  /** legacy props — accepted for backwards compat, no visual effect */
  soft?: boolean
  compact?: boolean
}

export function MoneyInputRow({
  label,
  value,
  defaultValue,
  placeholder = '0',
  helper,
  hint,
  unit = '만원',
  className,
  name,
  optional,
  autoFocus,
  onValueChange,
}: MoneyInputRowProps) {
  const [focused, setFocused] = useState(false)
  const isControlled = value !== undefined

  const display = isControlled
    ? value === undefined || value === null ? '' : formatNumber(value)
    : undefined

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onValueChange) return
    const raw = e.target.value.replace(/[^0-9]/g, '')
    onValueChange(raw === '' ? '' : Number(raw))
  }

  const supportText = hint ?? helper

  return (
    <label className={cn('block', className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-semibold tracking-[-0.008em] text-fb-ink">{label}</span>
        {optional ? <span className="text-[12px] font-medium text-fb-ink-3">선택</span> : null}
      </div>
      <div
        className={cn(
          'flex h-14 items-center rounded-[12px] border bg-white px-4 transition-[border-color,box-shadow] duration-150',
          focused ? 'border-fb-trust shadow-[0_0_0_3px_rgba(0,102,255,0.12)]' : 'border-fb-line-strong shadow-none',
        )}
      >
        <input
          name={name}
          inputMode="numeric"
          autoFocus={autoFocus}
          value={display}
          defaultValue={!isControlled && defaultValue !== undefined ? formatNumber(defaultValue) : undefined}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          aria-label={label}
          className="fb-num h-full min-w-0 flex-1 border-none bg-transparent text-[18px] font-semibold tracking-[-0.012em] text-fb-ink outline-none"
        />
        <span className="ml-2 shrink-0 text-[15px] font-medium text-fb-ink-3">{unit}</span>
      </div>
      {supportText ? <p className="mt-2 text-[13px] font-medium leading-[1.5] text-fb-ink-3">{supportText}</p> : null}
    </label>
  )
}

export function TextField({
  label,
  value,
  placeholder,
  helper,
  className,
  type = 'text',
  name,
}: {
  label: string
  value?: string
  placeholder?: string
  helper?: string
  className?: string
  type?: string
  name?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-[14px] font-semibold tracking-[-0.008em] text-fb-ink">{label}</span>
      <div
        className={cn(
          'flex h-12 items-center rounded-[12px] border bg-white px-4 transition-[border-color,box-shadow] duration-150',
          focused ? 'border-fb-trust shadow-[0_0_0_3px_rgba(0,102,255,0.12)]' : 'border-fb-line-strong shadow-none',
        )}
      >
        <input
          type={type}
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-full min-w-0 flex-1 border-none bg-transparent text-[15px] font-medium text-fb-ink outline-none"
        />
      </div>
      {helper ? <p className="mt-2 text-[13px] font-medium text-fb-ink-3">{helper}</p> : null}
    </label>
  )
}
