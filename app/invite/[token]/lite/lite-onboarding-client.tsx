'use client'

import { useRouter } from 'next/navigation'
import { LiteOnboarding, type LiteOnboardingCompletePayload } from '@/components/fire-banking/lite-onboarding'

type Props = {
  token: string
  prevValues?: { income: number; recur: number; save: number } | null
}

export function LiteOnboardingClient({ token, prevValues }: Props) {
  const router = useRouter()

  const handleComplete = (_payload: LiteOnboardingCompletePayload) => {
    // TODO(R1): wire to server action for persisting spouse lite check-in data.
    // No server action / DB table exists yet in R0 — navigating to dashboard as placeholder.
    router.push('/dashboard')
  }

  return (
    <LiteOnboarding
      token={token}
      prevValues={prevValues}
      onComplete={handleComplete}
    />
  )
}
