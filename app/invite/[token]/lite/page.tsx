import { MobileAppShell } from '@/components/fire-banking'
import { LiteOnboardingClient } from './lite-onboarding-client'

export default async function LitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Previous-month reuse is hidden until at least one saved spouse check-in exists.
  const prevValues: null = null

  return (
    <MobileAppShell>
      <LiteOnboardingClient token={token} prevValues={prevValues} />
    </MobileAppShell>
  )
}
