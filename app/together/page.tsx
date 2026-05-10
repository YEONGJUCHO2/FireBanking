import { BottomNav, MobileAppShell } from '@/components/fire-banking'
import { InviteLinkShareActions } from '@/src/features/couple/components/InviteLinkShareActions'
import { AdminPartnerCard } from '@/src/features/dashboard/components/AdminPartnerCard'
import { getDashboardPartnerState } from '@/src/features/dashboard/lib/getDashboardPartnerState'
import { cn } from '@/lib/cn'

export default async function TogetherPage() {
  const partnerState = await getDashboardPartnerState()

  // Derive 4-state partner status from Supabase state
  // 'no-invite' | 'sent' | 'accepted' | 'completed'
  const partnerStatus: 'no-invite' | 'sent' | 'accepted' | 'completed' =
    partnerState.state === 'no_workspace'
      ? 'no-invite'
      : partnerState.state === 'needs_invite'
        ? partnerState.latestInviteUrl
          ? 'sent'
          : 'no-invite'
      : partnerState.state === 'waiting_for_input' && partnerState.connectedPartnerCount === 0
        ? 'sent'
        : partnerState.state === 'waiting_for_input'
          ? 'accepted'
          : 'completed'

  const adminDone = true
  const liteDone = partnerStatus === 'completed'
  const myName = '나'
  const partnerName = '배우자'
  const hasWorkspace = partnerState.state !== 'no_workspace'
  const partnerPending = partnerStatus === 'sent' || partnerStatus === 'no-invite'

  const partnerLabel =
    partnerStatus === 'no-invite'
      ? '아직 초대 전'
      : partnerStatus === 'sent'
        ? '초대 보냄 · 수락 대기'
        : partnerStatus === 'accepted'
          ? '수락 완료 · 입력 대기'
          : '이번 달 입력 완료'

  const inviteUrl =
    partnerState.state !== 'no_workspace' ? partnerState.latestInviteUrl : undefined
  const showInviteWorkflow = hasWorkspace && partnerStatus === 'no-invite'
  const showInputReminder = partnerStatus === 'sent' || partnerStatus === 'accepted'

  return (
    <MobileAppShell>
      <main
        data-screen-label="together"
        className="flex flex-1 flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="border-b border-fb-line-soft px-5 pb-4 pt-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
            TOGETHER
          </p>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.020em] text-fb-ink">
            우리 가족
          </h1>
        </header>

        <div className="flex-1 overflow-auto px-4 pb-6 pt-5 space-y-2.5">
          {/* Partner connection status */}
          <div data-od-id="partner-status">
            {/* Admin row */}
            <div className="rounded-[14px] border border-fb-line bg-white px-[18px] py-[18px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-fb-ink font-bold text-white">
                    {myName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-fb-ink">{myName}</div>
                    <div className="text-[11px] text-fb-ink-3">리드 파트너 · 풀 입력</div>
                  </div>
                </div>
                <div
                  className={cn(
                    'text-[11px] font-bold',
                    adminDone ? 'text-fb-positive' : 'text-fb-ink-4',
                  )}
                >
                  {adminDone ? '✓ 입력 완료' : '미입력'}
                </div>
              </div>
            </div>

            {/* Partner row — Lite */}
            <div className="mt-2.5 rounded-[14px] border border-fb-line bg-white px-[18px] py-[18px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-fb-trust-soft font-bold text-fb-trust">
                    {partnerName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-fb-ink">{partnerName}</div>
                    <div className="text-[11px] text-fb-ink-3">배우자 · 간단 입력</div>
                  </div>
                </div>
                <div
                  className={cn(
                    'text-[11px] font-bold',
                    partnerStatus === 'completed'
                      ? 'text-fb-positive'
                      : partnerStatus === 'no-invite'
                        ? 'text-fb-ink-3'
                        : 'text-fb-trust',
                  )}
                >
                  {partnerLabel}
                </div>
              </div>

            </div>
          </div>

          {showInviteWorkflow ? (
            <section data-od-id="invite-link-card" className="space-y-3">
              <h2 className="text-[15px] font-bold tracking-[-0.010em] text-fb-ink">
                배우자 초대
              </h2>
              <div data-od-id="cta-share-invite">
                <AdminPartnerCard
                  coupleId={partnerState.coupleId}
                  connectedPartnerCount={partnerState.connectedPartnerCount}
                  latestInviteUrl={partnerState.latestInviteUrl}
                />
              </div>
            </section>
          ) : null}

          {showInputReminder ? (
            <section
              data-od-id="amount-input-reminder"
              className="rounded-[14px] border border-fb-line bg-white px-[18px] py-[18px]"
            >
              <p className="text-[12px] font-semibold tracking-[0.06em] text-fb-ink-3">
                배우자 금액 입력 알림
              </p>
              <p className="mt-1.5 text-[14px] font-bold leading-[1.5] text-fb-ink">
                배우자에게 이번 달 금액 입력을 요청하세요.
              </p>
              <p className="mt-1 text-[12px] leading-[1.5] text-fb-ink-2">
                세후 월수입, 반복지출, 정기저축/투자만 입력하면 결과가 합산돼요. 링크를 복사해서 배우자에게 보내주세요.
              </p>
              <InviteLinkShareActions inviteUrl={inviteUrl} />
            </section>
          ) : null}

          {/* Primary CTA — single button fitted to current partner state */}
          <div data-od-id="cta-primary">
            {partnerStatus === 'no-invite' && !hasWorkspace ? (
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-fb-ink text-[14px] font-bold text-white"
              >
                배우자 초대하기
              </button>
            ) : liteDone ? (
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-fb-positive text-[14px] font-bold text-white"
              >
                결과 확인하기
              </button>
            ) : null}
          </div>
        </div>
      </main>

      <div data-od-id="bottom-nav">
        <BottomNav active="together" partnerPending={partnerPending} />
      </div>
    </MobileAppShell>
  )
}
