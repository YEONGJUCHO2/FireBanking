import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { BrandLockup, BrandMark } from './brand'
import { Icon, type IconName } from './icons'

export function PageCanvas({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn('min-h-dvh w-full bg-fb-page px-4 py-5 md:px-8 md:py-10', className)}>
      {children}
    </main>
  )
}

export function MobileAppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <PageCanvas>
      <div
        className={cn(
          'fb-phone-frame mx-auto flex min-h-[min(calc(100dvh-2.5rem),820px)] w-full max-w-[430px] flex-col bg-fb-page',
          className,
        )}
      >
        <PhoneStatusBar />
        {children}
      </div>
    </PageCanvas>
  )
}

export function AppHeader({
  title,
  subtitle,
  right,
  showBrand = false,
  backHref,
  className,
}: {
  title?: string
  subtitle?: string
  right?: ReactNode
  showBrand?: boolean
  backHref?: string
  className?: string
}) {
  return (
    <header className={cn('flex items-start justify-between gap-3 px-5 pb-3 pt-2', className)}>
      <div className="min-w-0">
        {backHref ? (
          <a
            href={backHref}
            aria-label="뒤로 가기"
            className="fbpress -ml-2 mb-3 inline-flex size-9 items-center justify-center rounded-full text-fb-ink hover:bg-fb-card-alt"
          >
            <Icon name="chevron-left" className="size-5" />
          </a>
        ) : null}
        {showBrand ? <BrandLockup compact /> : null}
        {title ? (
          <h1 className="text-[22px] font-bold leading-[1.25] tracking-[-0.020em] text-fb-ink">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mt-2 max-w-[24rem] text-[13px] font-medium leading-[1.55] text-fb-ink-3">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0 pt-1">{right}</div> : null}
    </header>
  )
}

export function HeaderIconButton({ icon, label }: { icon: IconName; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="fbpress inline-flex size-9 items-center justify-center rounded-full text-fb-ink-2 hover:bg-fb-card-alt hover:text-fb-ink"
    >
      <Icon name={icon} className="size-[22px]" />
    </button>
  )
}

/** Translucent in-app top bar used inside the dashboard body */
export function ScreenTopBar({
  title,
  right,
  className,
}: {
  title?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-fb-line-soft bg-white/85 px-4 py-3 backdrop-blur',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <BrandMark size="sm" />
        {title ?? <span className="text-[14px] font-semibold text-fb-ink">Fire Banking</span>}
      </div>
      {right}
    </div>
  )
}

function PhoneStatusBar() {
  return (
    <div className="flex h-9 items-center justify-between px-5 pt-2 text-[12px] font-bold text-fb-ink">
      <span className="fb-num">9:41</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="flex h-3.5 items-end gap-0.5">
          <span className="h-1.5 w-1 rounded-sm bg-fb-ink" />
          <span className="h-2 w-1 rounded-sm bg-fb-ink" />
          <span className="h-2.5 w-1 rounded-sm bg-fb-ink" />
          <span className="h-3 w-1 rounded-sm bg-fb-ink" />
        </span>
        <span className="relative h-3 w-4 rounded-[2px] border border-fb-ink">
          <span className="absolute inset-y-0.5 left-0.5 w-2.5 rounded-[1px] bg-fb-ink" />
          <span className="absolute -right-1 top-1 h-1.5 w-0.5 rounded-r bg-fb-ink" />
        </span>
      </div>
    </div>
  )
}
