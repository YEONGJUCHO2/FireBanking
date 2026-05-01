import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'kakao' | 'soft' | 'dangerSoft'
type ButtonSize = 'md' | 'lg' | 'sm'

type ButtonProps = {
  children: ReactNode
  href?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-fb-green text-white shadow-card hover:bg-fb-green-900',
  secondary: 'border border-fb-line bg-white text-fb-ink shadow-card hover:border-fb-green/35',
  ghost: 'text-fb-muted hover:bg-fb-green-50 hover:text-fb-green',
  kakao: 'bg-fb-kakao text-[#381E1F] hover:brightness-95',
  soft: 'bg-fb-green-100 text-fb-green hover:bg-fb-green/15',
  dangerSoft: 'bg-fb-danger-bg text-fb-danger hover:brightness-[0.98]',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-[15px]',
  lg: 'h-14 px-6 text-base',
}

export function Button({ children, href, variant = 'primary', size = 'md', className, disabled, ...buttonProps }: ButtonProps) {
  const classes = cn(
    'fb-focus inline-flex items-center justify-center whitespace-nowrap rounded-button font-semibold tracking-[-0.02em] transition active:scale-[0.99]',
    sizeClass[size],
    variantClass[variant],
    disabled && 'pointer-events-none opacity-50',
    className,
  )

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || undefined}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled} {...buttonProps}>
      {children}
    </button>
  )
}
