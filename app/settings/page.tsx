import { BottomNav, MobileAppShell } from '@/components/fire-banking'
import { SignOutButton } from '@/src/features/auth/components/SignOutButton'

const rows: Array<{ label: string; value: string }> = [
  { label: '로그인 상태', value: '연결됨' },
  { label: '화폐 단위', value: '원 (만원 표시)' },
]

export default function SettingsPage() {
  return (
    <MobileAppShell>
      <main className="flex-1 overflow-auto pb-8">
        <header className="border-b border-fb-line-soft px-5 pb-4 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">SETTINGS</p>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.020em] text-fb-ink">설정</h1>
        </header>

        <section className="px-4 pt-3">
          <div className="overflow-hidden rounded-[14px] border border-fb-line bg-white">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={
                  'flex items-center justify-between px-4 py-4' +
                  (i === rows.length - 1 ? '' : ' border-b border-fb-line-soft')
                }
              >
                <span className="text-[14px] font-medium text-fb-ink">{row.label}</span>
                <span className="text-[13px] text-fb-ink-3">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center">
            <SignOutButton />
          </div>
        </section>
      </main>
      <BottomNav active="settings" />
    </MobileAppShell>
  )
}
