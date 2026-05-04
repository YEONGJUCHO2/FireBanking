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

        <div className="px-4 pt-5">
          <div className="rounded-[16px] border border-fb-line bg-white px-5 py-8 text-center">
            <p className="text-[15px] font-bold text-fb-ink">아직 저장된 월별 기록이 없어요.</p>
            <p className="mt-2 text-[13px] leading-[1.5] text-fb-ink-3">
              온보딩 완료나 이번 달 값 수정으로 저장된 현금흐름 스냅샷만 이곳에 쌓입니다.
              자산 가격 스냅샷은 월말 자동 작업으로 별도 저장돼요.
            </p>
          </div>
        </div>
      </main>
      <BottomNav active="history" />
    </MobileAppShell>
  )
}
