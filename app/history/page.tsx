import { BottomNav, MobileAppShell } from '@/components/fire-banking'

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

        <div className="px-4 pt-5 space-y-3">
          <div className="rounded-[18px] border border-fb-line bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.014em] text-fb-ink">
                  2026년 5월
                </h2>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12px] font-semibold text-fb-ink-3">FIRE까지 남은 금액</p>
                <div className="mt-1 flex items-baseline justify-end gap-2">
                  <span className="text-[15px] font-black text-fb-positive">↓ 320만원</span>
                  <span className="text-[24px] font-black tracking-[-0.020em] text-fb-trust">
                    7억 6,500만원
                  </span>
                </div>
              </div>
            </div>

            <details className="mt-4 group rounded-[14px] border border-fb-line bg-fb-card-alt">
              <summary
                role="button"
                aria-label="상세 정보 보기"
                className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-bold text-fb-ink"
              >
                상세 정보 보기
                <span className="text-fb-ink-3 transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="border-t border-fb-line px-4 pb-4 pt-3">
                <p className="text-[12px] font-medium text-fb-ink-3">
                  목표 월 생활비 300만원 · FIRE 목표자산 9억원 기준
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <HistoryMiniMetric label="FIRE 반영 순자산" value="1억 3,500만원" />
                  <HistoryMiniMetric label="월 자산 증가 여력" value="+280만원" />
                  <HistoryMiniMetric label="예상 도달" value="13년 6개월 후" />
                  <HistoryMiniMetric label="계산 가정" value="연 5% · 25배" muted />
                </div>
              </div>
            </details>

          </div>
        </div>
      </main>
      <BottomNav active="history" />
    </MobileAppShell>
  )
}

function HistoryMiniMetric({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="rounded-[13px] border border-fb-line bg-white px-3 py-3">
      <p className="text-[11px] font-semibold text-fb-ink-3">{label}</p>
      <p className={`mt-1 text-[14px] font-bold ${muted ? 'text-fb-ink-3' : 'text-fb-ink'}`}>
        {value}
      </p>
    </div>
  )
}
