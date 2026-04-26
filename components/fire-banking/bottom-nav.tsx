import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from './icons'

const navItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/dashboard', label: '홈', icon: 'home' },
  { href: '/onboarding', label: '기록', icon: 'calendar' },
  { href: '/subscribe', label: '고정비', icon: 'chart' },
  { href: '/invite/demo-token', label: '함께', icon: 'users' },
  { href: '/design-system', label: '설정', icon: 'settings' },
]

export function BottomNav({ active = '홈' }: { active?: string }) {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-fb-line bg-fb-surface/92 px-2 py-2 backdrop-blur fb-safe-area">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = item.label === active
          return (
            <Link key={item.label} href={item.href} className={cn('flex flex-col items-center justify-center gap-1 rounded-soft py-2 text-[11px] font-bold transition', isActive ? 'text-fb-green' : 'text-fb-muted hover:bg-fb-green-50 hover:text-fb-green')}>
              <Icon name={item.icon} className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
