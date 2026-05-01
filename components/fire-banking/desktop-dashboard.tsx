import type { ReactNode } from 'react'
import Link from 'next/link'
import { BrandMark } from './brand'
import { Button } from './button'
import { Card } from './card'
import { CheckinRow } from './checkin-row'
import { FireTimelineWide } from './fire-timeline'
import { Icon } from './icons'
import { StatusPill } from './status-pill'
import { cn } from '@/lib/cn'

const data = {
  totalNetWorthMan: 51_500,
  netDeltaMan: 320,
  homeMan: 38_000,
  investableMan: 13_500,
  otherMan: 1_500,
  fireTargetMan: 40_000,
  incomeMan: 850,
  fixedMan: 350,
  variableMan: 220,
  saveMan: 180,
  monthlyAddMan: 280,
  fireYears: 8,
  fireMonths: 4,
}

const navItems = ['대시보드', '체크인', '시뮬레이터', '히스토리'] as const

export function DesktopDashboard({ footerAction }: { footerAction?: ReactNode }) {
  const percent = Math.max(0, Math.min(1, data.investableMan / data.fireTargetMan))
  return (
    <section className="mx-auto w-full max-w-[1280px] rounded-[28px] border border-fb-line bg-white">
      {/* topbar */}
      <header className="flex h-16 items-center justify-between border-b border-fb-line-soft bg-white/85 px-8 backdrop-blur">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" />
            <span className="text-[15px] font-bold text-fb-ink">Fire Banking</span>
          </div>
          <nav className="ml-4 flex gap-1">
            {navItems.map((label, i) => (
              <Link
                key={label}
                href="/dashboard"
                className={cn(
                  'flex h-9 items-center rounded-full px-3.5 text-[13px] font-semibold',
                  i === 0
                    ? 'bg-fb-ink text-white'
                    : 'text-fb-ink-2 hover:bg-fb-card-alt hover:text-fb-ink',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-fb-ink-3">2026. 04. 체크인 진행 중</span>
          <span className="flex size-8 items-center justify-center rounded-full bg-fb-ink text-[12px] font-bold text-white">
            지
          </span>
          {footerAction}
        </div>
      </header>

      <div className="px-12 py-8">
        {/* page header */}
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
              2026 APRIL · 우리 가족 워크스페이스
            </div>
            <h1 className="mt-1.5 text-[28px] font-bold tracking-[-0.024em] text-fb-ink">
              이번 달 결과를 같이 봐요.
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" iconLeft={<Icon name="share" className="size-[18px]" />}>
              결과 공유
            </Button>
            <Button
              variant="inverse"
              size="md"
              href="/subscribe"
              iconRight={<Icon name="chevron-right" className="size-[18px]" />}
            >
              시뮬레이터 열기
            </Button>
          </div>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          {/* LEFT */}
          <div className="flex flex-col gap-5">
            <Card radius="hero" className="p-8">
              <div className="flex items-baseline justify-between">
                <div className="text-[13px] font-medium text-fb-ink-3">우리 가족 표시 순자산</div>
                <StatusPill tone="positive">↑ {data.netDeltaMan} 만원 vs 3월</StatusPill>
              </div>
              <div className="fb-num mt-2 flex items-baseline gap-1.5">
                <span className="text-[64px] font-bold leading-none tracking-[-0.030em] text-fb-ink">
                  {data.totalNetWorthMan.toLocaleString('ko-KR')}
                </span>
                <span className="text-[22px] font-bold text-fb-ink-2">만원</span>
              </div>

              <div className="mt-7 grid grid-cols-4 gap-5 border-t border-fb-line pt-6">
                <Stat label="거주 부동산" value={data.homeMan} />
                <Stat label="투자가능 (FIRE)" value={data.investableMan} highlight />
                <Stat label="기타 순자산" value={data.otherMan} />
                <Stat label="FIRE 목표" value={data.fireTargetMan} muted />
              </div>
            </Card>

            <Card radius="hero" className="p-7">
              <div className="mb-5 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
                    FIRE까지 남은 거리
                  </div>
                  <h3 className="mt-1.5 text-[20px] font-bold tracking-[-0.012em] text-fb-ink">
                    현재 입력 기준 시뮬레이션
                  </h3>
                </div>
                <div className="flex gap-1.5">
                  {(['거리감', '날짜', '%'] as const).map((label, i) => (
                    <button
                      key={label}
                      className={cn(
                        'h-[30px] rounded-full border px-3 text-[12px] font-semibold',
                        i === 0
                          ? 'border-fb-ink bg-fb-ink text-white'
                          : 'border-fb-line-strong bg-white text-fb-ink-2',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <FireTimelineWide
                percent={percent}
                years={data.fireYears}
                months={data.fireMonths}
                fireValueManWon={data.fireTargetMan}
                hereValueManWon={data.investableMan}
              />

              <div className="mt-6 grid grid-cols-3 gap-6">
                <DStat label="월 자산 증가 여력" value={`+${data.monthlyAddMan}`} unit="만원" trust />
                <DStat label="이번 달 저축률" value="21" unit="%" />
                <DStat label="FIRE 도달 시점" value="2034. 8." />
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            <Card radius="hero" className="p-6">
              <div className="mb-3 h-[2px] w-6 rounded-[2px] bg-fb-ink" />
              <h3 className="text-[17px] font-bold text-fb-ink">이번 달 부부 체크인</h3>
              <div className="mt-3">
                <CheckinRow name="지윤" role="admin" status="done" when="오늘 14:08 입력" />
                <div className="fb-divider" />
                <CheckinRow name="민호" role="lite" status="pending" when="초대 수락 · 입력 대기 중" />
              </div>
              <div className="mt-3 rounded-[12px] bg-fb-cautionary-soft p-3 text-[12px] font-medium leading-[1.5] text-fb-cautionary-ink">
                배우자 체크인이 완료되면 이번 달 결과가 확정돼요.
              </div>
            </Card>

            <Card radius="hero" className="p-6">
              <div className="mb-3 h-[2px] w-6 rounded-[2px] bg-fb-ink" />
              <h3 className="text-[17px] font-bold text-fb-ink">이번 달 현금흐름</h3>
              <div className="mt-4 flex flex-col gap-3">
                <CFRow label="월 세후 수입" value={`+${data.incomeMan}`} />
                <CFRow label="고정비" value={`−${data.fixedMan}`} />
                <CFRow label="변동비" value={`−${data.variableMan}`} />
                <CFRow label="저축 / 투자" value={`−${data.saveMan}`} trust />
                <div className="fb-divider" />
                <CFRow label="자산 증가 여력" value={`+${data.monthlyAddMan}`} hero />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  highlight,
  muted,
}: {
  label: string
  value: number
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div>
      <div className="text-[12px] font-medium text-fb-ink-3">{label}</div>
      <div
        className={cn(
          'fb-num mt-1 text-[22px] font-bold tracking-[-0.012em]',
          highlight ? 'text-fb-trust' : muted ? 'text-fb-ink-2' : 'text-fb-ink',
        )}
      >
        {value.toLocaleString('ko-KR')}
        <span className="ml-1 text-[12px] font-semibold text-fb-ink-3">만원</span>
      </div>
    </div>
  )
}

function DStat({
  label,
  value,
  unit,
  trust,
}: {
  label: string
  value: string
  unit?: string
  trust?: boolean
}) {
  return (
    <div>
      <div className="text-[12px] font-medium text-fb-ink-3">{label}</div>
      <div
        className={cn(
          'fb-num mt-1 text-[24px] font-bold tracking-[-0.012em]',
          trust ? 'text-fb-trust' : 'text-fb-ink',
        )}
      >
        {value}
        {unit ? <span className="ml-1 text-[11px] font-semibold text-fb-ink-3">{unit}</span> : null}
      </div>
    </div>
  )
}

function CFRow({
  label,
  value,
  trust,
  hero,
}: {
  label: string
  value: string
  trust?: boolean
  hero?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={cn(
          hero ? 'text-[14px] font-bold text-fb-ink' : 'text-[13px] font-medium text-fb-ink-2',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'fb-num font-bold tracking-[-0.008em]',
          hero ? 'text-[22px] text-fb-trust' : trust ? 'text-[14px] text-fb-trust' : 'text-[14px] text-fb-ink',
        )}
      >
        {value}
        <span className="ml-1 text-[11px] font-semibold text-fb-ink-3">만원</span>
      </span>
    </div>
  )
}
