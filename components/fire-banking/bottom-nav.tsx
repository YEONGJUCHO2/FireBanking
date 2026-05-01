import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from './icons'

type TabId = 'home' | 'history' | 'analyze' | 'together' | 'settings'

const tabs: Array<{ id: TabId; href: string; label: string; icon: IconName }> = [
  { id: 'home', href: '/dashboard', label: '홈', icon: 'home' },
  { id: 'history', href: '/history', label: '기록', icon: 'history' },
  { id: 'analyze', href: '/insights', label: '분석', icon: 'sparkle' },
  { id: 'together', href: '/together', label: '함께', icon: 'users' },
  { id: 'settings', href: '/settings', label: '설정', icon: 'settings' },
]

export function BottomNav({
  active = 'home',
  partnerPending = true,
  className,
}: {
  active?: TabId | string
  partnerPending?: boolean
  className?: string
}) {
  return (
    <nav
      className={cn(
        'sticky bottom-0 z-20 border-t border-fb-line-soft bg-white/94 backdrop-blur-xl pt-2 pb-[22px] fb-safe-area',
        className,
      )}
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          const showBadge = tab.id === 'together' && partnerPending
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'fbpress relative flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-semibold tracking-[-0.004em]',
                isActive ? 'text-fb-trust' : 'text-fb-ink-3',
              )}
            >
              <Icon
                name={tab.icon}
                className={cn(
                  'size-[22px]',
                  isActive
                    ? 'text-fb-trust [&>circle]:fill-fb-trust-soft [&>rect]:fill-fb-trust-soft [&>path:first-child]:fill-fb-trust-soft'
                    : '',
                )}
              />
              <span>{tab.label}</span>
              {showBadge ? (
                <span className="absolute right-[calc(50%-16px)] top-1 size-2 rounded-full border-2 border-white bg-fb-negative" />
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
