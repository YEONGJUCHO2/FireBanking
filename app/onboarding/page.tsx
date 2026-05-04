import { MobileAppShell } from '@/components/fire-banking'
import { OnboardingStepper } from '@/components/fire-banking/onboarding-stepper'
import { getOnboardingAccessState } from '@/src/features/onboarding/lib/onboardingAccessState'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const access = await getOnboardingAccessState()

  if (!access.canStartOnboarding) {
    redirect('/dashboard')
  }

  return (
    <MobileAppShell className="h-[min(calc(100dvh-2.5rem),820px)]">
      <OnboardingStepper
        doneHref="/dashboard"
        backOutHref="/"
      />
    </MobileAppShell>
  )
}
