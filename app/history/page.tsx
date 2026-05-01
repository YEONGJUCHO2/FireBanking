import { BottomNav, MobileAppShell } from '@/components/fire-banking'
import { cn } from '@/lib/cn'

const months = [
  { m: '2026. 04', net: '5억 1,500', delta: '+220', mood: '편안' },
  { m: '2026. 03', net: '5억 1,280', delta: '+180', mood: '편안' },
  { m: '2026. 02', net: '5억 1,100', delta: '-40', mood: '걱정' },
  { m: '2026. 01', net: '5억 1,140', delta: '+310', mood: '기쁨' },
  { m: '2025. 12', net: '5억 0,830', delta: '+90', mood: '편안' },
]

export default function HistoryPage() {
  return (
    <MobileAppShell>
      <main className="flex-1 overflow-auto pb-8">
        <header className="border-b border-fb-line-soft px-5 pb-4 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">HISTORY</p>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.020em] text-fb-ink">월별 체크인 기록</h1>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-fb-ink-2">
            매달 저장된 우리 가족의 숫자.<br />
            지난 달과 비교해서 천천히 보세요.
          </p>
        </header>

        <div className="space-y-2.5 px-4 pt-3">
          {months.map((mo) => {
            const isPos = mo.delta.startsWith('+')
            return (
              <div
                key={mo.m}
                className="flex items-center justify-between rounded-[14px] border border-fb-line bg-white px-4 py-4"
              >
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.06em] text-fb-ink-3">{mo.m}</div>
                  <div className="fb-num mt-1 text-[18px] font-bold tracking-[-0.012em] text-fb-ink">
                    {mo.net}만원
                  </div>
                  <div className="mt-0.5 text-[12px] text-fb-ink-3">분위기 · {mo.mood}</div>
                </div>
                <div
                  className={cn(
                    'fb-num text-[14px] font-bold',
                    isPos ? 'text-fb-positive' : 'text-fb-negative',
                  )}
                >
                  {mo.delta}만
                </div>
              </div>
            )
          })}
        </div>
      </main>
      <BottomNav active="history" />
    </MobileAppShell>
  )
}
