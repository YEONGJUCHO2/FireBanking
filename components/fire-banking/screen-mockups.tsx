import { dashboardMetrics, liteRows } from '@/lib/sample-data'
import { formatManWon, formatNumber } from '@/lib/format'
import { BrandLockup } from './brand'
import { Button } from './button'
import { ProgressStepper } from './progress-stepper'
import { Icon } from './icons'
import Image from 'next/image'

export function PhoneMockup({ children, label, subtitle, scale = 1 }: { children: React.ReactNode; label?: string; subtitle?: string; scale?: number }) {
  const match = label?.match(/^(\d+)\s*(.*)$/)
  const number = match?.[1] ?? '•'
  const text = match?.[2] ?? label
  const width = 320 * scale
  const height = 760 * scale

  return (
    <div className="group" style={{ width }}>
      {label ? (
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-fb-trust text-xs font-bold text-white shadow-card">{number}</span>
          <div>
            <p className="text-sm font-bold tracking-normal text-fb-ink">{text}</p>
            {subtitle ? <p className="text-xs text-fb-ink-2">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <div className="relative transition duration-700 ease-out group-hover:-translate-y-2" style={{ width, height }}>
        <div className="fb-phone-frame h-[760px] w-[320px] origin-top-left overflow-hidden bg-fb-card transition duration-700 ease-out group-hover:shadow-elevated" style={{ transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginScreenPreview() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden px-5 py-6">
      <Image src="/fire-banking/landing-background.png" alt="" fill sizes="320px" className="absolute inset-0 object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.34)_48%,rgba(0,102,255,0.28)_100%)]" />
      <div className="relative z-10">
        <BrandLockup />
        <section className="mt-12">
          <h1 className="text-[2rem] font-bold leading-tight tracking-normal text-fb-ink">부부가 함께<br />순자산과 경제적 자유<br />진척을 확인해요.</h1>
        </section>
      </div>
      <div className="relative z-10 mt-auto">
        <div className="grid gap-3"><Button size="lg">시작하기</Button><Button variant="secondary" size="lg">로그인</Button></div>
        <div className="mt-5 flex gap-3 rounded-card border border-white/75 bg-white/84 p-4 text-xs leading-5 text-fb-ink-2 shadow-card backdrop-blur">
          <Icon name="shield" className="mt-0.5 size-4 shrink-0 text-fb-trust" />
          <p><span className="font-bold text-fb-trust">안전하게 보호돼요.</span> 결과 계산에 필요한 정보만 다룹니다.</p>
        </div>
      </div>
    </div>
  )
}

function MockStatusBar() {
  return (
    <div className="flex h-8 items-center justify-between text-[11px] font-bold text-fb-ink">
      <span>9:41</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="flex h-3.5 items-end gap-0.5">
          <span className="h-1.5 w-1 rounded-sm bg-fb-ink" />
          <span className="h-2 w-1 rounded-sm bg-fb-ink" />
          <span className="h-2.5 w-1 rounded-sm bg-fb-ink" />
          <span className="h-3 w-1 rounded-sm bg-fb-ink" />
        </span>
        <span className="h-3 w-4 rounded-[0.2rem] border border-fb-ink" />
      </div>
    </div>
  )
}

function MockBackButton() {
  return <span className="inline-flex size-7 items-center justify-center text-xl leading-none text-fb-ink">‹</span>
}

export function OnboardingScreenPreview() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-fb-page">
      {/* Top nav */}
      <div className="flex items-center justify-between bg-fb-page/85 px-3 py-3 backdrop-blur">
        <MockBackButton />
        <span className="fb-num text-[13px] font-semibold text-fb-ink-2">
          1 <span className="text-fb-ink-4">/ 5</span>
        </span>
        <span className="size-11" />
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-2">
        <div className="h-[3px] overflow-hidden rounded-full bg-[#F0F0F2]">
          <div className="h-full w-0 rounded-full bg-fb-trust" />
        </div>
      </div>

      {/* Body — step 1: 한 달 총지출 */}
      <div className="flex-1 overflow-hidden px-6 pt-5">
        <div className="flex flex-col items-center text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
            가구 캐시플로우
          </span>
          <h1 className="mt-2 whitespace-pre-line text-[22px] font-bold leading-[1.30] tracking-[-0.022em] text-fb-ink">
            {'한 달 총지출은\n얼마쯤인가요?'}
          </h1>
          <p className="mt-3 whitespace-pre-line text-[12px] font-medium leading-[1.55] text-fb-ink-2">
            {'지금 생활의 기준점부터 잡아요.\n총액만 입력해도 돼요.'}
          </p>

          {/* Big number input mock */}
          <div className="mt-6 flex w-2/3 items-baseline justify-center gap-2 rounded-[20px] border border-fb-trust bg-white px-5 py-5 shadow-[0_0_0_4px_rgba(0,102,255,0.12)]">
            <span className="fb-num text-[40px] font-bold tracking-[-0.024em] text-fb-ink-4">0</span>
            <span className="text-[16px] font-bold text-fb-ink-3">만원</span>
          </div>

          <p className="mt-3 text-[11px] font-medium leading-[1.55] text-fb-ink-3">
            정확한 가계부보다 첫 FIRE 거리감을 보는 것이 먼저입니다.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-fb-page/0 via-fb-page/92 to-fb-page px-5 pb-7 pt-3.5">
        <button
          type="button"
          className="flex h-[50px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-fb-ink text-[14px] font-bold text-white"
        >
          다음
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  )
}

function CompactMoneyRow({ label, value }: { label: string; value: number }) {
  return (
    <label className="grid grid-cols-[132px_1fr] items-center gap-2">
      <span className="whitespace-nowrap text-[11px] font-extrabold leading-none tracking-normal text-fb-ink">{label}</span>
      <span className="relative block">
        <input
          readOnly
          value={formatNumber(value)}
          className="fb-input h-10 rounded-[0.55rem] px-3 pr-9 text-right text-[12px] font-extrabold"
          aria-label={label}
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-fb-ink-2">만원</span>
      </span>
    </label>
  )
}

export function DashboardScreenPreview() {
  const m = dashboardMetrics
  const percent = Math.max(0, Math.min(1, m.fireNetWorthMan / m.fireTargetAssetMan))
  const pct = percent
  const fireSize = 32
  const fireTrackInset = fireSize / 2

  return (
    <div className="flex h-full flex-col bg-fb-page pt-2">
      <MockStatusBar />

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-fb-line-soft bg-white/85 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="flex size-5 items-center justify-center rounded-[5px] bg-fb-ink text-[9px] font-black text-white">FB</span>
          <span className="text-[11px] font-semibold text-fb-ink">Fire Banking</span>
        </div>
        <span className="text-[10px] font-semibold text-fb-ink-3">⚙</span>
      </div>

      <div className="flex-1 overflow-hidden px-3 pb-0 pt-3">
        {/* Month label + greeting + status pill */}
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">2026. 05 체크인</div>
            <div className="mt-0.5 text-[13px] font-bold tracking-[-0.012em] text-fb-ink">안녕하세요, 나님</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-fb-trust-soft px-2 py-0.5 text-[8px] font-semibold text-fb-trust-ink">
            <span className="size-1 rounded-full bg-fb-trust" />
            배우자 수락 대기
          </span>
        </div>

        {/* Hero NetWorth card */}
        <section className="rounded-[18px] border border-fb-line bg-fb-card p-3 shadow-elevated">
          <div className="flex items-start justify-between">
            <p className="text-[8px] font-medium text-fb-ink-3">FIRE까지 남은 금액</p>
            <div className="flex rounded-full border border-fb-line bg-white p-0.5">
              <span className="rounded-full bg-fb-ink px-1.5 py-px text-[7px] font-bold text-white">금액</span>
              <span className="px-1.5 py-px text-[7px] font-bold text-fb-ink-2">기간</span>
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[28px] font-bold leading-[1.1] tracking-[-0.024em] text-fb-ink">
              {(m.fireTargetAssetMan - m.fireNetWorthMan).toLocaleString('ko-KR')}
            </span>
            <span className="text-[12px] font-bold text-fb-ink-2">만원</span>
          </div>
          <p className="mt-1 text-[7px] font-medium text-fb-ink-3">
            월 300만원 생활비 기준 · 연 5%, 25배 룰
          </p>
          <div className="my-2.5 h-px bg-fb-line" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <MockBreakdown label="목표 월 생활비" value="300" />
            <MockBreakdown label="FIRE 목표자산" value={formatManWon(m.fireTargetAssetMan)} highlight />
            <MockBreakdown label="FIRE 계산 순자산" value={formatManWon(m.fireNetWorthMan)} highlight badge="FIRE" />
            <MockBreakdown label="월 자산 증가 여력" value={formatManWon(m.monthlyAssetGrowthCapacityMan)} />
          </div>
        </section>

        {/* FireTimeline card */}
        <section className="mt-2.5 rounded-[18px] border border-fb-line bg-fb-card p-3 shadow-elevated">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[8px] font-bold text-fb-ink">FIRE까지 남은 금액</span>
            <span className="text-[8px] font-extrabold text-fb-trust">
              {(m.fireTargetAssetMan - m.fireNetWorthMan).toLocaleString('ko-KR')}만원
            </span>
          </div>
          {/* Progress track */}
          <div className="relative my-1 h-7">
            <div
              className="absolute left-0 top-2.5 h-1.5 overflow-hidden rounded-full bg-fb-card-mute"
              style={{ width: `calc(100% - ${fireTrackInset}px)` }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-fb-trust to-[#3385FF]"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <div
              className="absolute top-[7px] size-[14px] rounded-full border-[3px] border-fb-trust bg-white shadow-[0_0_0_2px_rgba(0,102,255,0.12)]"
              style={{ left: `calc(${pct * 100}% - ${fireTrackInset * pct + 7}px)` }}
            />
            {/* Fire GIF at 100% end */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://em-content.zobj.net/source/animated-noto-color-emoji/356/fire_1f525.gif"
              alt="FIRE"
              className="absolute right-0 top-[-2px] size-[32px] object-contain"
              draggable={false}
            />
          </div>
          {/* Tick labels */}
          <div className="relative h-3 text-[7px] font-bold">
            <span className={`absolute left-0 ${pct >= 0 ? 'text-fb-trust' : 'text-fb-ink-3'}`}>0%</span>
            <span className={`absolute -translate-x-1/2 ${pct >= 0.25 ? 'text-fb-trust' : 'text-fb-ink-3'}`} style={{ left: '33.333%' }}>25%</span>
            <span className={`absolute -translate-x-1/2 ${pct >= 0.5 ? 'text-fb-trust' : 'text-fb-ink-3'}`} style={{ left: '66.667%' }}>50%</span>
            <span className={`absolute right-0 text-center ${pct >= 1 ? 'text-fb-trust' : 'text-fb-ink-3'}`} style={{ width: fireSize }}>100%</span>
          </div>
        </section>

        {/* 2-up metric grid */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <MockMetric title="FIRE 계산 순자산" value={formatManWon(m.fireNetWorthMan)} trust />
          <MockMetric title="FIRE 목표자산" value={formatManWon(m.fireTargetAssetMan)} />
          <MockMetric title="월 자산 증가 여력" value={formatManWon(m.monthlyAssetGrowthCapacityMan)} positive />
          <MockMetric title="FIRE까지" value="17년 3개월" trust />
        </div>

        {/* Cashflow summary (compact) */}
        <section className="mt-2.5 rounded-[14px] border border-fb-line bg-fb-card p-3">
          <div className="mb-1.5 flex items-center gap-1">
            <div className="h-[2px] w-3 rounded-full bg-fb-ink" />
            <h2 className="text-[9px] font-bold text-fb-ink">이번 달 현금흐름</h2>
          </div>
          <div className="space-y-1.5">
            <MockCFRow label="월 세후 수입" value="+850" positive />
            <MockCFRow label="고정비" value="−350" />
            <MockCFRow label="변동비" value="−220" />
            <MockCFRow label="저축 / 투자" value="−180" trust />
            <div className="h-px bg-fb-line" />
            <MockCFRow label="자산 증가 여력" value="+280" hero />
          </div>
        </section>
      </div>

      <MockBottomNav active="홈" />
    </div>
  )
}

function MockBreakdown({ label, value, highlight = false, badge }: { label: string; value: string; highlight?: boolean; badge?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[7px] font-medium text-fb-ink-3">
        {label}
        {badge ? <span className="rounded-[3px] bg-fb-trust-soft px-1 py-px text-[6px] font-bold text-fb-trust-ink">{badge}</span> : null}
      </div>
      <div className={`fb-num mt-0.5 text-[11px] font-bold ${highlight ? 'text-fb-trust' : 'text-fb-ink'}`}>
        {value}<span className="ml-0.5 text-[8px] font-semibold text-fb-ink-3">만원</span>
      </div>
    </div>
  )
}

function MockCFRow({ label, value, positive = false, trust = false, hero = false }: { label: string; value: string; positive?: boolean; trust?: boolean; hero?: boolean }) {
  const color = positive ? 'text-fb-positive' : trust ? 'text-fb-trust' : hero ? 'text-fb-trust' : 'text-fb-ink'
  return (
    <div className="flex items-baseline justify-between">
      <span className={`${hero ? 'text-[8px] font-bold text-fb-ink' : 'text-[7px] font-medium text-fb-ink-2'}`}>{label}</span>
      <span className={`fb-num ${hero ? 'text-[13px] font-bold' : 'text-[9px] font-semibold'} ${color}`}>
        {value}<span className="ml-0.5 text-[6px] font-semibold text-fb-ink-3">만원</span>
      </span>
    </div>
  )
}

function MockMetric({ title, value, delta, caption, small = false, wide = false, trust = false, positive = false }: { title: string; value: string; delta?: string; caption?: string; small?: boolean; wide?: boolean; trust?: boolean; positive?: boolean }) {
  const valueColor = trust ? 'text-fb-trust' : positive ? 'text-fb-positive' : 'text-fb-ink'
  return (
    <section className={wide ? 'rounded-[0.8rem] border border-fb-line bg-white p-3 shadow-card' : 'rounded-[0.8rem] border border-fb-line bg-white p-3 shadow-card'}>
      <p className="text-[9px] font-bold tracking-normal text-fb-ink-2">{title}</p>
      <p className={`mt-1 font-black leading-tight tracking-normal ${valueColor} ${small ? 'text-[13px]' : 'text-[14px]'}`}>{value}</p>
      {delta ? <p className="mt-1 text-[8px] font-bold text-fb-trust">전월 대비 {delta}</p> : null}
      {caption ? <p className="mt-1 text-[8px] font-bold leading-4 text-fb-ink-2">{caption}</p> : null}
    </section>
  )
}

function MockBottomNav({ active }: { active: string }) {
  const items = [
    { label: '홈', icon: 'home' as const },
    { label: '기록', icon: 'calendar' as const },
    { label: '함께', icon: 'users' as const },
    { label: '설정', icon: 'plus' as const },
  ]

  return (
    <nav className="mt-auto border-t border-fb-line bg-fb-card/95 px-1 py-2">
      <div className="grid grid-cols-4">
        {items.map((item) => (
          <span key={item.label} className={item.label === active ? 'flex flex-col items-center gap-1 text-[9px] font-bold text-fb-trust' : 'flex flex-col items-center gap-1 text-[9px] font-bold text-fb-ink-2'}>
            <Icon name={item.icon} className="size-4" />
            {item.label}
          </span>
        ))}
      </div>
    </nav>
  )
}

export function InviteScreenPreview() {
  return (
    <div className="flex h-full flex-col bg-fb-page px-5 pb-5 pt-3">
      <MockStatusBar />

      {/* Brand header */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-[8px] bg-fb-ink text-[12px] font-black text-white">FB</div>
          <span className="text-[13px] font-semibold text-fb-ink">Fire Banking</span>
        </div>
        <button type="button" className="h-9 rounded-full bg-fb-card-alt px-3 text-[11px] font-semibold text-fb-ink-2">
          Admin으로 돌아가기
        </button>
      </div>

      {/* Hero */}
      <div className="mt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
          초대가 도착했어요
        </p>
        <h2 className="mt-2 text-[20px] font-bold leading-[1.28] tracking-[-0.024em] text-fb-ink">
          부부 워크스페이스에<br />함께 들어와 주세요.
        </h2>
        <p className="mt-2.5 text-[11px] font-medium leading-[1.55] text-fb-ink-2">
          매일 쓰는 가계부가 아니에요.<br />월 1회, 큰 숫자 몇 개만 같이 보면 돼요.
        </p>
      </div>

      {/* Reassurance card */}
      <div className="mt-5 rounded-[16px] border border-fb-line bg-fb-card-alt p-3.5">
        <div className="flex flex-col gap-2.5">
          <MockReassureRow text="초대한 계정의 입력 내역은 보이지 않아요." />
          <MockReassureRow text="내 숫자도 합산 결과로만 표시돼요." />
          <MockReassureRow text="언제든 워크스페이스에서 나갈 수 있어요." />
        </div>
      </div>

      <div className="flex-1" />

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <button type="button" className="h-12 w-full rounded-[14px] bg-fb-ink text-[13px] font-bold text-white">
          워크스페이스 참여하기
        </button>
        <button type="button" className="h-10 w-full rounded-[14px] text-[12px] font-semibold text-fb-ink-2">
          나중에 할게요
        </button>
      </div>

      {/* R0 alpha notice */}
      <div className="mt-3 rounded-[11px] border border-fb-line bg-fb-card p-3">
        <p className="text-[9px] font-bold leading-[1.55] text-fb-ink">배우자 체크인은 R1에서 열립니다</p>
        <p className="mt-0.5 text-[8px] font-medium leading-[1.55] text-fb-ink-2">
          R0에서 초대 의향을 확인하기 위한 알파 기능입니다.
        </p>
      </div>
    </div>
  )
}

function MockReassureRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border border-fb-line bg-white">
        <Icon name="check" className="size-2.5 text-fb-ink" />
      </span>
      <span className="text-[10px] font-medium leading-[1.5] text-fb-ink">{text}</span>
    </div>
  )
}

export function LiteScreenPreview() {
  return (
    <div className="flex h-full flex-col px-5 pb-5 pt-3">
      <MockStatusBar />
      <div className="mt-3"><MockBackButton /></div>
      <header className="mt-2">
        <h1 className="text-[16px] font-black tracking-normal text-fb-ink">나의 기본 정보</h1>
        <p className="mt-3 text-[12px] font-medium leading-5 text-fb-ink-2">정확하지 않아도 괜찮아요.<br />지금은 첫 거리감을 보는 단계예요.</p>
      </header>
      <p className="mt-5 text-right text-[10px] font-bold text-fb-ink-2">단위: 만원</p>
      <div className="mt-3 space-y-5">
        {liteRows.map((row) => (
          <CompactMoneyRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      <div className="mt-9 rounded-[0.75rem] bg-fb-trust-soft p-4 text-center text-[12px] font-bold text-fb-trust">
        지난달과 같아요
      </div>
      <p className="mt-5 rounded-[0.75rem] bg-fb-card-alt/60 p-4 text-[11px] leading-5 text-fb-ink-2">지난달과 같다면 빠르게 진행할 수 있어요.</p>
      <button className="mt-auto h-12 rounded-[0.65rem] bg-fb-trust text-[13px] font-bold text-white shadow-card">다음</button>
      <div className="pt-4">
        <ProgressStepper steps={['입력', '확인', '완료']} current={0} />
      </div>
    </div>
  )
}

export function SimulatorScreenPreview() {
  // Mock data — static, no Supabase
  const fixedTotal = 230 // 만원
  const variableTotal = 85
  const buffer = 15
  const recommended = fixedTotal + variableTotal + buffer // 330
  const baseline = 300
  const diff = recommended - baseline // +30

  const summaryTiles = [
    { label: '월 고정비', value: fixedTotal, highlight: false },
    { label: '월 변동비', value: variableTotal, highlight: false },
    { label: '버퍼', value: buffer, highlight: false },
    { label: '계산된 월 생활비', value: recommended, highlight: true },
  ]

  const categories = [
    { name: '주거', amount: 100, on: true },
    { name: '통신', amount: 15, on: true },
    { name: '보험', amount: 30, on: true },
    { name: '구독', amount: 12, on: true },
    { name: '차량', amount: 40, on: false },
    { name: '교육', amount: 15, on: true },
    { name: '기타', amount: 18, on: true },
  ]

  return (
    <div className="flex h-full flex-col bg-fb-page pt-2">
      <MockStatusBar />

      {/* Top nav */}
      <div className="flex items-center justify-between border-b border-fb-line bg-white/85 px-4 py-2 backdrop-blur">
        <span className="text-[11px] font-bold text-fb-ink">‹ 홈</span>
        <span className="text-[11px] font-semibold text-fb-ink">FIRE 생활비 조정기</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-hidden px-3 pb-0 pt-3 space-y-2.5">
        {/* Hero card */}
        <section className="rounded-[18px] border border-fb-line bg-fb-card p-3 shadow-card">
          <p className="text-[7px] font-bold tracking-[-0.005em] text-fb-trust">FIRE 생활비 조정기</p>
          <h2 className="mt-0.5 text-[11px] font-bold leading-[1.30] tracking-[-0.020em] text-fb-ink">
            목표 월 생활비를 현실적인 생활 수준으로 조정해요
          </h2>

          {/* 4-tile metrics */}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {summaryTiles.map((tile) => (
              <div
                key={tile.label}
                className={`rounded-[7px] p-2 ${
                  tile.highlight
                    ? 'border border-[rgba(0,102,255,0.22)] bg-[#EAF2FE]'
                    : 'border border-[rgba(112,115,124,0.10)] bg-fb-card-alt'
                }`}
              >
                <p className="text-[6px] font-semibold text-fb-ink-3">{tile.label}</p>
                <p className={`fb-num mt-0.5 text-[10px] font-bold tracking-[-0.012em] ${tile.highlight ? 'text-[#003B95]' : 'text-fb-ink'}`}>
                  {tile.value}<span className="ml-px text-[6px] font-semibold text-fb-ink-3">만원</span>
                </p>
              </div>
            ))}
          </div>

          {/* 대시보드 대비 */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[7px] font-medium text-fb-ink-3">대시보드 기준 {baseline}만원 대비</span>
            <span className="fb-num rounded-full bg-[#FFF7F0] px-1.5 py-px text-[7px] font-bold text-[#9C5612]">
              +{diff}만원
            </span>
          </div>

          {/* 활성 고정비 */}
          <div className="mt-2 rounded-[7px] border border-[rgba(112,115,124,0.10)] bg-fb-card-alt px-2 py-1.5">
            <p className="fb-num text-[7px] font-bold text-fb-ink">활성 고정비 6개</p>
            <p className="mt-0.5 text-[6px] font-medium leading-[1.5] text-fb-ink-2">
              대시보드 수익률은 연 5% 기준으로 고정하고, 이 화면에서는 생활비 구성만 조정해요.
            </p>
          </div>
        </section>

        {/* 고정비 섹션 */}
        <section className="rounded-[14px] border border-fb-line bg-fb-card p-3 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold tracking-[-0.012em] text-fb-ink">고정비</p>
              <p className="fb-num mt-px text-[8px] font-bold text-fb-trust">{fixedTotal}만원</p>
            </div>
            <span className="text-[7px] font-bold text-fb-ink-3">펼치기</span>
          </div>
          <div className="mt-2 space-y-1">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`grid grid-cols-[20px_1fr_32px] items-center gap-1.5 rounded-[5px] border px-2 py-1 ${
                  cat.on
                    ? 'border-[rgba(0,102,255,0.22)] bg-[rgba(0,102,255,0.04)]'
                    : 'border-fb-line bg-white opacity-50'
                }`}
              >
                <span
                  className={`h-[13px] w-[22px] rounded-full relative ${cat.on ? 'bg-fb-trust' : 'bg-[#DBDCDF]'}`}
                >
                  <span
                    className="absolute top-[2px] size-[9px] rounded-full bg-white shadow"
                    style={{ left: cat.on ? 11 : 2 }}
                  />
                </span>
                <span className="text-[7px] font-bold text-fb-ink">{cat.name}</span>
                <span className="text-right text-[7px] font-bold text-fb-ink">{cat.amount}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 변동비 섹션 */}
        <section className="rounded-[14px] border border-fb-line bg-fb-card p-3 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold tracking-[-0.012em] text-fb-ink">변동비</p>
              <p className="fb-num mt-px text-[8px] font-bold text-fb-trust">{variableTotal}만원</p>
            </div>
            <span className="text-[7px] font-bold text-fb-ink-3">펼치기</span>
          </div>
        </section>

        {/* 버퍼 섹션 */}
        <section className="rounded-[14px] border border-fb-line bg-fb-card p-3 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-fb-ink">버퍼</p>
            <p className="fb-num text-[8px] font-bold text-fb-trust">{buffer}만원</p>
          </div>
          <div className="mt-2 flex gap-1">
            {[0, 5, 10, 15].map((p) => (
              <span key={p} className="flex-1 rounded-full border border-[rgba(112,115,124,0.22)] bg-white py-1 text-center text-[6px] font-bold text-fb-ink">
                {p}%
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* CTA 버튼 */}
      <div className="border-t border-fb-line bg-fb-page/95 px-3 pb-3 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <button className="h-9 rounded-[0.6rem] border border-[rgba(112,115,124,0.32)] bg-white text-[10px] font-bold text-fb-ink">
            초안 저장
          </button>
          <button className="h-9 rounded-[0.6rem] bg-fb-trust text-[10px] font-bold text-white">
            대시보드에 적용
          </button>
        </div>
      </div>
    </div>
  )
}

export function AssetsScreenPreview() {
  // Mock data — static, no Supabase
  const mockHoldings = [
    { name: '삼성전자', symbol: '005930', category: '일반', value: '1,530', badge: 'FIRE 반영' },
    { name: 'TIGER 미국S&P500', symbol: '360750', category: '일반', value: '210', badge: 'FIRE 반영' },
    { name: '연금저축 펀드', symbol: 'IRP', category: '연금저축', value: '3,200', badge: '제한·미래' },
  ]
  const mockLoans = [
    { label: '주식담보대출', balance: '500', interest: '15' },
  ]

  return (
    <div className="flex h-full flex-col bg-fb-page pt-2">
      <MockStatusBar />

      {/* Top nav */}
      <div className="flex items-center justify-between border-b border-fb-line-soft bg-white/85 px-4 py-2 backdrop-blur">
        <span className="text-[11px] font-bold text-fb-ink">‹ 홈</span>
        <span className="text-[11px] font-semibold text-fb-ink">FIRE 자산 진단</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-hidden px-3 pb-0 pt-3 space-y-2.5">
        {/* Hero — 공식 카드 */}
        <section className="rounded-[14px] border border-fb-line bg-fb-card p-3 shadow-elevated">
          <p className="text-[7px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">FIRE 반영 순자산 공식</p>
          <p className="mt-1 text-[10px] font-bold leading-snug tracking-[-0.012em] text-fb-ink">
            즉시 운용 가능 투자자산 <span className="text-fb-ink-3">−</span> 투자 연계 부채
          </p>
          <p className="mt-1.5 text-[7px] font-medium leading-[1.55] text-fb-ink-2">
            일반·기타 계좌 국내주식·ETF와 해외거래소 직접 보유는 FIRE 반영,
            연금저축·IRP는 제한·미래 자산으로 제외해요.
          </p>
        </section>

        {/* 투자자산 그룹 */}
        <section className="rounded-[14px] border border-fb-line bg-fb-card p-3 shadow-card">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-[9px] font-bold text-fb-ink">투자자산</p>
              <p className="text-[7px] font-medium text-fb-ink-3 mt-px leading-snug">
                국내주식·ETF 자동 시세, 미국 주식 수량×달러가×환율로 입력해요.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-fb-trust-soft px-1.5 py-px text-[7px] font-semibold text-fb-trust-ink">국내 상장 우선</span>
          </div>
          <div className="space-y-1.5">
            {mockHoldings.map((h, i) => (
              <div key={i} className="flex items-center justify-between border-b border-fb-line-soft py-1 last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[8px] font-bold text-fb-ink truncate">{h.name}</p>
                    <span className={`inline-flex items-center rounded-full px-1 py-px text-[6px] font-semibold ${h.badge === 'FIRE 반영' ? 'bg-fb-trust-soft text-fb-trust-ink' : 'bg-fb-card-alt text-fb-ink-3'}`}>{h.badge}</span>
                  </div>
                  <p className="fb-num text-[6px] font-medium text-fb-ink-3">{h.symbol} · {h.category}</p>
                </div>
                <p className="fb-num text-[9px] font-bold text-fb-ink shrink-0">{h.value}<span className="text-[6px] font-semibold text-fb-ink-3 ml-0.5">만</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* 투자 연계 부채 그룹 */}
        <section className="rounded-[14px] border border-fb-line bg-fb-card p-3 shadow-card">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-[9px] font-bold text-fb-ink">투자 연동 대출</p>
              <p className="text-[7px] font-medium text-fb-ink-3 mt-px leading-snug">
                투자자산 취득을 위한 대출만 FIRE 반영 순자산에서 차감해요.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-fb-trust-soft px-1.5 py-px text-[7px] font-semibold text-fb-trust-ink">FIRE 보정</span>
          </div>
          {mockLoans.map((lb, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-fb-line-soft last:border-0">
              <div>
                <p className="text-[8px] font-bold text-fb-ink">{lb.label}</p>
                <p className="fb-num text-[6px] font-medium text-fb-ink-3">월 이자 {lb.interest}만원</p>
              </div>
              <p className="fb-num text-[9px] font-bold text-fb-ink">{lb.balance}<span className="text-[6px] font-semibold text-fb-ink-3 ml-0.5">만</span></p>
            </div>
          ))}
        </section>
      </div>

      <MockBottomNav active="홈" />
    </div>
  )
}

