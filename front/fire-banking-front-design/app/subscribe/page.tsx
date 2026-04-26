import { AppHeader, BottomNav, FixedCostSimulator, MobileAppShell } from '@/components/fire-banking'

export default function SubscribePage() {
  return (
    <MobileAppShell>
      <AppHeader title="고정비 시뮬레이터" subtitle="반복 지출이 FIRE 목표에 주는 영향을 비난 없이 확인해요." backHref="/dashboard" />
      <div className="px-5 pb-5"><FixedCostSimulator /></div>
      <BottomNav active="분석" />
    </MobileAppShell>
  )
}
