import { dashboardMetrics, liteRows, onboardingRows } from '@/lib/sample-data'
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
    <div className="flex h-full flex-col px-5 pb-5 pt-3">
      <MockStatusBar />
      <div className="mt-3"><MockBackButton /></div>

      <section className="mt-5">
        <h1 className="text-[1.55rem] font-black leading-[1.26] tracking-normal text-fb-ink">
          우리 가정의 기본 정보를
          <br />
          입력해 주세요
        </h1>
        <p className="mt-4 text-[13px] font-semibold leading-[1.75] tracking-normal text-fb-ink-2">
          정확하지 않아도 괜찮아요.
          <br />
          지금은 첫 거리감을 보는 단계예요.
        </p>
      </section>

      <form className="mt-4 flex min-h-0 flex-1 flex-col">
        <p className="mb-2 text-right text-[11px] font-bold text-fb-ink-2">단위: 만원</p>
        <div className="space-y-2">
          {onboardingRows.map((row) => (
            <CompactMoneyRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
        <Button className="mt-auto w-full" size="lg">다음</Button>
        <div className="pt-4">
          <ProgressStepper steps={['입력', '확인', '완료']} current={0} />
        </div>
      </form>
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
    <div className="flex h-full flex-col px-4 pb-4 pt-3">
      <MockStatusBar />
      <header className="mt-4 flex items-center gap-2">
        <MockBackButton />
        <h1 className="text-[15px] font-black tracking-normal text-fb-ink">배우자 초대</h1>
      </header>
      <section className="mt-[76px] text-center">
        <Image src="/fire-banking/invite-mugs-cutout.png" alt="" width={128} height={96} className="mx-auto h-[84px] w-[118px] object-contain" />
        <h2 className="mt-6 text-[18px] font-black leading-[1.55] tracking-normal text-fb-ink">
          배우자가 참여하면
          <br />
          이번 달 결과가 더 또렷해져요.
        </h2>
      </section>
      <div className="mt-7 space-y-4 text-[11px] font-bold leading-5 text-fb-ink-2">
        <p className="flex items-center gap-3"><Icon name="wallet" className="size-5 shrink-0" />각자의 입력이 합쳐져 더 정확한 결과 제공</p>
        <p className="flex items-center gap-3"><Icon name="users" className="size-5 shrink-0" />서로의 목표와 진행 상황을 함께 확인</p>
        <p className="flex items-center gap-3"><Icon name="lock" className="size-5 shrink-0" />프라이버시는 지키면서 함께 설계</p>
      </div>
      <div className="mt-auto rounded-[0.95rem] border border-fb-line bg-fb-trust-soft/55 p-3 shadow-card">
        <p className="pb-3 text-center text-[11px] font-bold leading-5 text-fb-ink-2">
          언제든 참여할 수 있어요.
          <br />
          부담 없이 초대해 보세요.
        </p>
        <div className="grid gap-2">
          <button className="h-11 rounded-[0.55rem] bg-fb-trust text-[13px] font-bold text-white shadow-card">초대 링크 생성</button>
          <button className="h-10 rounded-[0.55rem] border border-fb-line bg-white text-[12px] font-bold text-fb-ink">링크 복사</button>
          <button className="inline-flex h-10 items-center justify-center rounded-[0.55rem] bg-fb-kakao text-[12px] font-bold text-[#381E1F]"><Icon name="kakao" className="mr-1.5 size-4" />카카오톡 공유</button>
        </div>
      </div>
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
  return (
    <div className="flex h-full flex-col px-4 pb-5 pt-3">
      <MockStatusBar />
      <div className="mt-3"><MockBackButton /></div>
      <header className="mt-2">
        <h1 className="text-[16px] font-black tracking-normal text-fb-ink">고정비 시뮬레이터</h1>
      </header>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-[0.9rem] border border-fb-line bg-white p-3 shadow-card">
        <button className="h-9 rounded-[0.5rem] bg-fb-trust text-[12px] font-bold text-white">설정</button>
        <button className="h-9 rounded-[0.5rem] bg-fb-card-alt/70 text-[12px] font-bold text-fb-ink-2">결과 비교</button>
      </div>
      <section className="mt-4 space-y-2.5">
        {[
          ['월 실수령액', '600'],
          ['시뮬레이션 기간', '20년'],
          ['투자 비율', '50%'],
          ['예상 수익률 (연)', '5.0%'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-fb-line/70 py-1.5">
            <span className="text-[11px] font-bold text-fb-ink">{label}</span>
            <span className="text-[11px] font-bold text-fb-ink-2">{value}</span>
          </div>
        ))}
      </section>
      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-black text-fb-ink">월 고정비 항목</h2>
          <span className="text-[10px] font-bold text-fb-ink-2">현재 합계 230만원</span>
        </div>
        <div className="space-y-1.5">
          {['주거비(대출/관리비)', '통신비', '보험료', '구독/멤버십', '차량유지비', '교육비', '기타 고정비'].map((label, index) => (
            <div key={label} className="grid grid-cols-[18px_1fr_58px] items-center gap-2 rounded-[0.45rem] bg-white px-2 py-1.5 shadow-[0_0_0_1px_var(--color-fb-line)]">
              <span className="grid size-4 place-items-center rounded-[0.18rem] bg-fb-trust text-white"><Icon name="check" className="size-3" /></span>
              <span className="text-[10px] font-bold text-fb-ink">{label}</span>
              <span className="rounded-[0.25rem] border border-fb-line px-2 py-1 text-right text-[10px] font-bold text-fb-ink">{[100, 15, 30, 12, 40, 15, 18][index]}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-4 rounded-[0.8rem] border border-fb-line bg-white p-3 shadow-card">
        <h2 className="text-[12px] font-black text-fb-ink">고정비를 줄이면 달라지는 미래 자산</h2>
        <div className="mt-4 flex h-28 items-end justify-center gap-10 rounded-[0.7rem] bg-fb-trust-soft p-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-fb-ink">4.2억</span>
            <span className="h-12 w-9 rounded-t bg-fb-ink-2/35" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-fb-trust">5.6억</span>
            <span className="h-20 w-9 rounded-t bg-fb-trust" />
          </div>
        </div>
      </section>
    </div>
  )
}
