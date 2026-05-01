import { BottomNav, MobileAppShell } from '@/components/fire-banking'

const cats = [
  { name: '주거', amt: 110, pct: 31 },
  { name: '식비·생활', amt: 95, pct: 27 },
  { name: '교통', amt: 42, pct: 12 },
  { name: '구독·통신', amt: 38, pct: 11 },
  { name: '기타', amt: 65, pct: 19 },
]

export default function InsightsPage() {
  return (
    <MobileAppShell>
      <main className="flex-1 overflow-auto pb-8">
        <header className="border-b border-fb-line-soft px-5 pb-4 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">INSIGHTS</p>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.020em] text-fb-ink">이번 달 분석</h1>
        </header>

        <section className="px-4 pt-5">
          <div className="rounded-[18px] bg-fb-ink p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">저축률</p>
            <div className="fb-num mt-1.5 flex items-baseline gap-1.5">
              <span className="text-[48px] font-light tracking-[-0.04em]">21</span>
              <span className="text-[18px] font-medium text-white/60">%</span>
            </div>
            <p className="mt-2 text-[12px] leading-[1.5] text-white/60">
              지난 달 18%에서 3p 늘었어요.<br />
              FIRE까지 약 8년 4개월 남았습니다.
            </p>
          </div>

          <h2 className="mt-6 text-[14px] font-bold tracking-[-0.005em] text-fb-ink">지출 분포</h2>
          <div className="mt-3 rounded-[14px] border border-fb-line bg-white px-4 py-4">
            {cats.map((cat) => (
              <div key={cat.name} className="mb-3.5 last:mb-0">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-fb-ink">{cat.name}</span>
                  <span className="fb-num text-[12px] text-fb-ink-3">
                    {cat.amt}만 · {cat.pct}%
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-fb-line">
                  <div className="h-full rounded-full bg-fb-trust" style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav active="analyze" />
    </MobileAppShell>
  )
}
