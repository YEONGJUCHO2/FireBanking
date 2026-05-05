import { BottomNav, MobileAppShell } from '@/components/fire-banking'
import { AdminPartnerCard } from '@/src/features/dashboard/components/AdminPartnerCard'
import { getDashboardPartnerState } from '@/src/features/dashboard/lib/getDashboardPartnerState'
import { formatNextCheckinDate } from '@/src/lib/checkinDate'
import { cn } from '@/lib/cn'

export default async function TogetherPage() {
  const partnerState = await getDashboardPartnerState()

  // Derive 4-state partner status from Supabase state
  // 'no-invite' | 'sent' | 'accepted' | 'completed'
  const partnerStatus: 'no-invite' | 'sent' | 'accepted' | 'completed' =
    partnerState.state === 'no_workspace' || partnerState.state === 'needs_invite'
      ? 'no-invite'
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

  const checkinStatusText =
    liteDone
      ? '두 분 모두 입력을 마쳤어요 — 결과가 합산되었어요'
      : adminDone
        ? `${partnerName}님 입력이 끝나면 결과가 확정돼요`
        : '먼저 관리자 입력을 끝내 주세요'

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

              {/* Invite link row — shown when partner not yet completed and not no-invite state */}
              {partnerStatus === 'sent' || partnerStatus === 'accepted' ? (
                <div data-od-id="invite-link-card" className="mt-3.5">
                  <div className="flex items-center gap-2 rounded-[10px] bg-fb-card-alt px-3 py-2.5">
                    <span className="fb-num flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium text-fb-ink-2">
                      {inviteUrl ?? 'firebanking.app/invite/…'}
                    </span>
                    <button
                      type="button"
                      className="fbpress h-[30px] rounded-full border border-fb-line bg-white px-2.5 text-[11px] font-bold text-fb-ink"
                    >
                      복사
                    </button>
                  </div>
                  <div data-od-id="cta-share-invite">
                    <button
                      type="button"
                      className="fbpress mt-2.5 flex h-[42px] w-full items-center justify-center rounded-[12px] border border-fb-line bg-white text-[13px] font-bold text-fb-ink"
                    >
                      초대 화면 미리보기
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Invite link card for no-invite state + AdminPartnerCard (preserves test assertions) */}
          {hasWorkspace ? (
            <section data-od-id="invite-link-card" className="space-y-3">
              <h2 className="text-[15px] font-bold tracking-[-0.010em] text-fb-ink">
                {partnerState.state === 'needs_invite' ? '배우자 초대' : '배우자 연결'}
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

          {/* 이번 달 체크인 상태 */}
          <div
            data-od-id="checkin-status"
            className="rounded-[14px] border border-fb-line bg-white px-[18px] py-[18px]"
          >
            <p className="text-[12px] font-semibold tracking-[0.06em] text-fb-ink-3">
              이번 달 체크인
            </p>
            <p className="mt-1.5 text-[14px] font-bold text-fb-ink">{checkinStatusText}</p>
          </div>

          {/* 다음 체크인 컨텍스트 */}
          <div
            data-od-id="card-next-checkin"
            className="rounded-[14px] border border-fb-trust/18 bg-fb-trust/[0.04] px-[18px] py-5"
          >
            <p className="text-[13px] font-semibold tracking-[-0.005em] text-fb-trust">
              다음 체크인
            </p>
            <p className="mt-1 text-[18px] font-bold tracking-[-0.012em] text-fb-ink">
              {formatNextCheckinDate()}
            </p>
            <p className="mt-1.5 text-[12px] leading-[1.5] text-fb-ink-2">
              매달 첫째 주에 함께 3분만 들여요.<br />
              알림은 두 분 모두에게 갑니다.
            </p>
          </div>

          {/* Primary CTA — single button fitted to current partner state */}
          <div data-od-id="cta-primary">
            {partnerStatus === 'no-invite' && !hasWorkspace ? (
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-fb-ink text-[14px] font-bold text-white"
              >
                배우자 초대하기
              </button>
            ) : partnerStatus === 'sent' ? (
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center rounded-[14px] border border-fb-trust bg-white text-[14px] font-bold text-fb-trust"
              >
                초대 링크 다시 보내기
              </button>
            ) : partnerStatus === 'accepted' ? (
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-fb-ink text-[14px] font-bold text-white"
              >
                배우자 입력 대기 중…
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
