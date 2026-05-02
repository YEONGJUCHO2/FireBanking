import { MobileAppShell } from '@/components/fire-banking'
import { OnboardingStepper } from '@/components/fire-banking/onboarding-stepper'

export default function OnboardingPage() {
  return (
    <MobileAppShell className="h-[min(calc(100dvh-2.5rem),820px)]">
      <OnboardingStepper
        initial={{ goalExpense: 300, income: 850, fixed: 350, variable: 220, save: 180, investable: 12000 }}
        doneHref="/dashboard"
        backOutHref="/"
      />
    </MobileAppShell>
  )
}
