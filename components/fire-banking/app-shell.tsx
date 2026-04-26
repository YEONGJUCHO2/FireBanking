import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { BrandLockup } from './brand'
import { Icon } from './icons'

export function PageCanvas({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn('min-h-dvh px-4 py-5 md:px-8 md:py-8', className)}>{children}</main>
}

export function MobileAppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <PageCanvas>
      <div className={cn('fb-phone-frame mx-auto min-h-[min(calc(100dvh-2.5rem),820px)] w-full max-w-[430px]', className)}>
        <PhoneStatusBar />
        {children}
      </div>
    </PageCanvas>
  )
}

export function AppHeader({ title, subtitle, right, showBrand = false, backHref }: { title?: string; subtitle?: string; right?: ReactNode; showBrand?: boolean; backHref?: string }) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-3">
      <div className="min-w-0">
        {backHref ? <a href={backHref} className="mb-4 inline-flex size-9 items-center justify-center rounded-full border border-fb-line bg-white text-fb-ink shadow-card">‹</a> : null}
        {showBrand ? <BrandLockup compact /> : null}
        {title ? <h1 className="text-2xl font-bold tracking-normal text-fb-ink">{title}</h1> : null}
        {subtitle ? <p className="mt-2 text-sm leading-6 text-fb-muted">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0 pt-1">{right}</div> : null}
    </header>
  )
}

function PhoneStatusBar() {
  return (
    <div className="flex h-9 items-center justify-between px-5 pt-2 text-[12px] font-bold text-fb-ink">
      <span>9:41</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="flex h-3.5 items-end gap-0.5">
          <span className="h-1.5 w-1 rounded-sm bg-fb-ink" />
          <span className="h-2 w-1 rounded-sm bg-fb-ink" />
          <span className="h-2.5 w-1 rounded-sm bg-fb-ink" />
          <span className="h-3 w-1 rounded-sm bg-fb-ink" />
        </span>
        <span className="relative h-3 w-4 rounded-[0.2rem] border border-fb-ink">
          <span className="absolute inset-y-0.5 left-0.5 w-2.5 rounded-[0.12rem] bg-fb-ink" />
          <span className="absolute -right-1 top-1 h-1.5 w-0.5 rounded-r bg-fb-ink" />
        </span>
      </div>
    </div>
  )
}

export function HeaderIconButton({ icon, label }: { icon: 'bell' | 'users' | 'settings'; label: string }) {
  return (
    <button aria-label={label} className="fb-focus inline-flex size-10 items-center justify-center rounded-full border border-fb-line bg-white text-fb-muted shadow-card transition hover:text-fb-green">
      <Icon name={icon} className="size-5" />
    </button>
  )
}
