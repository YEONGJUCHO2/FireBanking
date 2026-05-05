import { MobileAppShell } from '@/components/fire-banking'
import { LiteOnboardingClient } from './lite-onboarding-client'

export default async function LitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Token validation: no Supabase lookup needed for the visual route — an invalid
  // token will simply result in the form rendering without a prior-month snapshot.
  // The actual write (persistence) is deferred to R1 (see lite-onboarding-client.tsx).

  // Previous-month spouse snapshot lookup would go here when the DB table exists.
  // For now pass undefined so the "지난달과 같아요" reuse action is hidden.
  const prevValues: null = null

  return (
    <MobileAppShell>
      <LiteOnboardingClient token={token} prevValues={prevValues} />
    </MobileAppShell>
  )
}
