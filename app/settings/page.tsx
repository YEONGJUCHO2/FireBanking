import { BottomNav, MobileAppShell } from '@/components/fire-banking'
import { SignOutButton } from '@/src/features/auth/components/SignOutButton'
import { getCurrentUser } from '@/src/features/auth/lib/getCurrentUser'

// PRD hard rule: 동작하지 않는 가짜 행을 두지 말 것.
// 실제로 의미 있는 항목만 렌더링하고, 비활성 행은 cursor-default + 시각적으로 inert.

function SettingsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="px-1 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-fb-ink-3">
        {label}
      </p>
      <div className="overflow-hidden rounded-[14px] border border-fb-line bg-white">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({
  label,
  value,
  hint,
  isLast = false,
  odId,
}: {
  label: string
  value: string
  hint?: string
  isLast?: boolean
  odId?: string
}) {
  return (
    <div
      data-od-id={odId}
      className={
        'cursor-default px-[18px] py-3.5' +
        (isLast ? '' : ' border-b border-fb-line-soft')
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-medium text-fb-ink">{label}</span>
        <span className="fb-num text-right text-[13px] font-semibold text-fb-ink-3">{value}</span>
      </div>
      {hint ? (
        <p className="mt-1 text-[11px] font-medium text-fb-ink-3">{hint}</p>
      ) : null}
    </div>
  )
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  return (
    <MobileAppShell>
      <div data-screen-label="settings" className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto pb-[100px]">
          <header className="border-b border-fb-line-soft px-5 pb-4 pt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">SETTINGS</p>
            <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.020em] text-fb-ink">설정</h1>
          </header>

          <section className="px-4 pt-3">
            {/* 프로필 / 계정 */}
            <SettingsGroup label="프로필 / 계정">
              <div data-od-id="row-profile">
                <SettingsRow label="로그인 상태" value={user ? '연결됨' : '미연결'} />
                <SettingsRow label="화폐 단위" value="원 (만원 표시)" isLast />
              </div>
            </SettingsGroup>

            {/* 데이터 + 부부 공유 */}
            <SettingsGroup label="데이터 · 부부 공유">
              <div data-od-id="row-data-sharing">
                <SettingsRow label="공유 범위" value="합산 결과만" hint="개별 숫자는 서로 보이지 않아요" isLast />
              </div>
            </SettingsGroup>

            {/* FIRE 계산 가정 */}
            <SettingsGroup label="FIRE 계산 가정">
              <div data-od-id="row-fire-assumptions">
                <SettingsRow label="목표 자산 룰" value="연 생활비 × 25배" />
                <SettingsRow label="연 수익률 가정" value="5% (단순)" isLast />
              </div>
            </SettingsGroup>

            {/* 비-자문 면책 */}
            <div
              data-od-id="row-disclaimer"
              className="mt-4 rounded-[12px] bg-fb-card-alt px-3.5 py-3.5 text-[12px] font-medium leading-[1.55] text-fb-ink-3"
            >
              이 앱은 25배 룰과 연 5% 가정의 단순 시뮬레이션이에요.{' '}
              <strong className="font-bold text-fb-ink">투자 자문이 아닙니다.</strong>{' '}
              실제 투자 결정은 본인 판단으로요.
            </div>

            {/* 로그아웃 */}
            {user ? (
              <div data-od-id="cta-sign-out" className="mt-6 text-center">
                <SignOutButton />
              </div>
            ) : null}
          </section>
        </main>

        <div data-od-id="bottom-nav">
          <BottomNav active="settings" />
        </div>
      </div>
    </MobileAppShell>
  )
}
