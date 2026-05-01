import { AppHeader, Button, MobileAppShell, MoneyInputRow, ProgressStepper } from '@/components/fire-banking'
import { onboardingRows } from '@/lib/sample-data'
import { Icon } from '@/components/fire-banking/icons'

export default function OnboardingPage() {
  return (
    <MobileAppShell>
      <AppHeader title="우리 가정의 기본 정보를 입력해 주세요" subtitle="정확하지 않아도 괜찮아요. 지금은 첫 거리감을 보는 단계예요." backHref="/" />

      <form className="space-y-5 px-5 pb-6">
        <div className="flex items-center justify-end gap-2 text-[11px] text-fb-muted">
          <span>단위</span>
          <strong className="text-fb-ink">만원</strong>
        </div>

        <div className="fb-card divide-y divide-fb-line px-4">
          {onboardingRows.map((row) => (
            <MoneyInputRow key={row.label} label={row.label} value={row.value} helper={row.helper} />
          ))}
        </div>

        <div className="flex gap-3 rounded-card border border-fb-line bg-fb-surface p-4 text-xs leading-5 text-fb-muted">
          <Icon name="info" className="mt-0.5 size-4 shrink-0 text-fb-green" />
          <p>거주 부동산은 표시 순자산에는 포함하지만, R0 FIRE 계산에서는 제외해요. 계산 기준은 연 5%, 25배 룰 기반의 참고용 시뮬레이션입니다.</p>
        </div>

        <Button href="/dashboard" className="w-full" size="lg">다음</Button>
        <ProgressStepper steps={['입력', '확인', '완료']} current={0} />
      </form>
    </MobileAppShell>
  )
}
