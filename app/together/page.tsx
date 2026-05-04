import { BottomNav, MobileAppShell } from '@/components/fire-banking'
import { cn } from '@/lib/cn'
import { AdminPartnerCard } from '@/src/features/dashboard/components/AdminPartnerCard'
import { getDashboardPartnerState } from '@/src/features/dashboard/lib/getDashboardPartnerState'
import { formatNextCheckinDate } from '@/src/lib/checkinDate'

export default async function TogetherPage() {
  const partnerState = await getDashboardPartnerState()
  const adminDone = true
  const liteDone = partnerState.state === 'complete'
  const myName = '나'
  const partnerName = '배우자'
  const hasWorkspace = partnerState.state !== 'no_workspace'
  const partnerPending = partnerState.state === 'needs_invite' || partnerState.state === 'waiting_for_input'

  return (
    <MobileAppShell>
      <main className="flex-1 overflow-auto pb-8">
        <header className="border-b border-fb-line-soft px-5 pb-4 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">TOGETHER</p>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.020em] text-fb-ink">우리 가족</h1>
        </header>

        <section className="px-4 pt-5 space-y-2.5">
          <PartnerRow
            name={myName}
            initial="나"
            role="나 · 전체 입력"
            done={adminDone}
            tone="admin"
          />
          <PartnerRow
            name={partnerName}
            initial="배"
            role="배우자 · 간단 입력"
            done={liteDone}
            tone="lite"
          />

          <div className="mt-6 rounded-[14px] border border-fb-trust/20 bg-fb-trust/[0.04] px-4 py-5">
            <p className="text-[13px] font-semibold tracking-[-0.005em] text-fb-trust">다음 체크인</p>
            <p className="mt-1 text-[18px] font-bold tracking-[-0.012em] text-fb-ink">
              {formatNextCheckinDate()}
            </p>
            <p className="mt-1.5 text-[12px] leading-[1.5] text-fb-ink-2">
              매달 첫째 주에 함께 3분만 들여요.<br />
              알림은 두 분 모두에게 갑니다.
            </p>
          </div>

          {hasWorkspace ? (
            <section className="mt-6 space-y-3">
              <h2 className="text-[15px] font-bold tracking-[-0.010em] text-fb-ink">
                {partnerState.state === 'needs_invite' ? '배우자 초대' : '배우자 연결'}
              </h2>
              <AdminPartnerCard
                coupleId={partnerState.coupleId}
                connectedPartnerCount={partnerState.connectedPartnerCount}
                latestInviteUrl={partnerState.latestInviteUrl}
              />
            </section>
          ) : null}
        </section>
      </main>
      <BottomNav active="together" partnerPending={partnerPending} />
    </MobileAppShell>
  )
}

function PartnerRow({
  name,
  initial,
  role,
  done,
  tone,
}: {
  name: string
  initial: string
  role: string
  done: boolean
  tone: 'admin' | 'lite'
}) {
  return (
    <div className="rounded-[14px] border border-fb-line bg-white px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-full font-bold',
              tone === 'admin' ? 'bg-fb-ink text-white' : 'bg-fb-trust-soft text-fb-trust',
            )}
          >
            {initial}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-fb-ink">{name}</div>
            <div className="text-[11px] text-fb-ink-3">{role}</div>
          </div>
        </div>
        <div
          className={cn(
            'text-[11px] font-semibold',
            done ? 'text-fb-positive' : 'text-fb-ink-4',
          )}
        >
          {done ? '✓ 입력 완료' : tone === 'admin' ? '미입력' : '대기 중'}
        </div>
      </div>
    </div>
  )
}
