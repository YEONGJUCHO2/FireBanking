import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'inverse' | 'secondary' | 'ghost' | 'soft' | 'kakao' | 'dangerSoft'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  children?: ReactNode
  href?: string
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-fb-trust text-white border-fb-trust hover:bg-fb-trust-strong',
  inverse: 'bg-fb-ink text-white border-fb-ink hover:bg-black',
  secondary: 'bg-white text-fb-ink border-fb-line-strong hover:bg-fb-card-alt',
  ghost: 'bg-transparent text-fb-ink border-transparent hover:bg-fb-card-alt',
  soft: 'bg-fb-trust-soft text-fb-trust-ink border-fb-trust-soft hover:bg-[#DEE9FE]',
  kakao: 'bg-[#FEE500] text-[#191600] border-[#FEE500] hover:brightness-95',
  dangerSoft: 'bg-fb-negative-soft text-fb-negative-ink border-fb-negative-soft hover:brightness-[0.98]',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[14px] font-semibold rounded-[8px] gap-1.5',
  md: 'h-12 px-[18px] text-[15px] font-semibold rounded-[12px] gap-2',
  lg: 'h-14 px-[22px] text-[16px] font-bold rounded-[14px] gap-2.5',
}

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  full,
  iconLeft,
  iconRight,
  className,
  disabled,
  ...buttonProps
}: ButtonProps) {
  const classes = cn(
    'fbpress inline-flex items-center justify-center border tracking-[-0.012em]',
    'disabled:bg-fb-card-mute disabled:text-fb-ink-4 disabled:border-fb-line disabled:cursor-not-allowed',
    sizeClass[size],
    variantClass[variant],
    full && 'w-full',
    className,
  )

  const content = (
    <>
      {iconLeft ? <span className="flex shrink-0 items-center">{iconLeft}</span> : null}
      {children}
      {iconRight ? <span className="flex shrink-0 items-center">{iconRight}</span> : null}
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || undefined}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled} {...buttonProps}>
      {content}
    </button>
  )
}
