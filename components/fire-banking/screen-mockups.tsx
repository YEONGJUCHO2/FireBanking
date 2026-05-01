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
  return (
    <div className="flex h-full flex-col px-4 pb-0 pt-3">
      <MockStatusBar />
      <header className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-black tracking-normal text-fb-ink">대시보드</h1>
          <p className="mt-1 text-[10px] font-medium leading-4 text-fb-ink-2">우리의 경제적 자유 현황을 한눈에</p>
        </div>
        <div className="flex gap-2">
          <span className="grid size-8 place-items-center rounded-full border border-fb-line bg-white shadow-card"><Icon name="bell" className="size-4 text-fb-ink-2" /></span>
          <span className="grid size-8 place-items-center rounded-full border border-fb-line bg-white shadow-card"><Icon name="users" className="size-4 text-fb-ink-2" /></span>
        </div>
      </header>

      <div className="mt-4 space-y-3">
        <section className="relative min-h-[156px] overflow-hidden rounded-[0.9rem] p-4 text-white shadow-soft">
          <Image src="/fire-banking/login-mountain.png" alt="" fill sizes="300px" className="object-cover brightness-[0.58] contrast-[1.08]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,94,235,0.88),rgba(0,94,235,0.28))]" />
          <div className="relative z-10">
            <div className="flex justify-between gap-3">
              <p className="text-[10px] font-bold opacity-90">예상 FIRE 도달 시점</p>
              <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-fb-positive">정상</span>
            </div>
            <p className="mt-4 text-[32px] font-black leading-none tracking-normal">{m.expectedFireDateLabel}</p>
            <p className="mt-2 text-[11px] font-bold opacity-90">({m.expectedFireDistanceLabel})</p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2.5">
          <MockMetric title="표시 순자산" value={formatManWon(m.displayNetWorthMan)} delta="+2,800만원" />
          <MockMetric title="FIRE 계산 순자산" value={formatManWon(m.fireNetWorthMan)} delta="+320만원" />
          <MockMetric title="월 자산 증가 여력" value={formatManWon(m.monthlyAssetGrowthCapacityMan)} small />
          <MockMetric title="FIRE 목표 자산" value={formatManWon(m.fireTargetAssetMan)} small />
        </div>
        <MockMetric title="월 생활비 (예상)" value="300만원" caption="고정비 230만원 + 변동비 120만원 + 기타 20만원" wide />
        <section className="rounded-[0.8rem] border border-fb-line bg-fb-card-alt/60 p-3 text-[10px] leading-4 text-fb-ink-2">
          이 결과는 참고용 시뮬레이션이에요.
        </section>
      </div>

      <MockBottomNav active="홈" />
    </div>
  )
}

function MockMetric({ title, value, delta, caption, small = false, wide = false }: { title: string; value: string; delta?: string; caption?: string; small?: boolean; wide?: boolean }) {
  return (
    <section className={wide ? 'rounded-[0.8rem] border border-fb-line bg-white p-3 shadow-card' : 'rounded-[0.8rem] border border-fb-line bg-white p-3 shadow-card'}>
      <p className="text-[10px] font-bold tracking-normal text-fb-ink-2">{title}</p>
      <p className={small ? 'mt-2 text-[16px] font-black leading-tight tracking-normal text-fb-ink' : 'mt-2 text-[18px] font-black leading-tight tracking-normal text-fb-ink'}>{value}</p>
      {delta ? <p className="mt-1.5 text-[10px] font-bold text-fb-trust">전월 대비 {delta}</p> : null}
      {caption ? <p className="mt-1.5 text-[10px] font-bold leading-4 text-fb-ink-2">{caption}</p> : null}
    </section>
  )
}

function MockBottomNav({ active }: { active: string }) {
  const items = [
    { label: '홈', icon: 'home' as const },
    { label: '기록', icon: 'calendar' as const },
    { label: '분석', icon: 'chart' as const },
    { label: '설계', icon: 'mountain' as const },
    { label: '더보기', icon: 'plus' as const },
  ]

  return (
    <nav className="mt-auto border-t border-fb-line bg-fb-card/95 px-1 py-2">
      <div className="grid grid-cols-5">
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
        <h1 className="text-[16px] font-black tracking-normal text-fb-ink">나의 기본 정보 (Lite)</h1>
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
