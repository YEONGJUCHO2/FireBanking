import { MobileAppShell } from '@/components/fire-banking'
import { OnboardingStepper } from '@/components/fire-banking/onboarding-stepper'

export default function OnboardingPage() {
  return (
    <MobileAppShell className="h-[min(calc(100dvh-2.5rem),820px)]">
      <OnboardingStepper
        initial={{ income: 850, fixed: 350, variable: 220, save: 180, investable: 12000, home: 38000, other: 1500 }}
        doneHref="/dashboard"
        backOutHref="/"
      />
    </MobileAppShell>
  )
}
