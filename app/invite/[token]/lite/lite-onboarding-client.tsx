'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LiteOnboarding } from '@/components/fire-banking/lite-onboarding'
import {
  saveLiteCheckin,
  type SaveLiteCheckinState,
} from '@/src/features/couple/actions/saveLiteCheckin'

type Props = {
  token: string
  prevValues?: { income: number; recur: number; save: number } | null
}

const initialState: SaveLiteCheckinState = {}

export function LiteOnboardingClient({ token, prevValues }: Props) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(saveLiteCheckin, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard')
    }
  }, [router, state.success])

  const handleComplete = (payload: { incomeMan: number; expenseMan: number; savingsMan: number }) => {
    const formData = new FormData()
    formData.set('token', token)
    formData.set('incomeMan', String(payload.incomeMan))
    formData.set('expenseMan', String(payload.expenseMan))
    formData.set('savingsMan', String(payload.savingsMan))
    formAction(formData)
  }

  return (
    <>
      <LiteOnboarding
        token={token}
        prevValues={prevValues}
        onComplete={handleComplete}
        submitLabel={pending ? '저장 중...' : '내 입력 저장하기'}
        disabled={pending}
      />
      {state.error ? (
        <div className="absolute inset-x-5 bottom-[92px] z-30 rounded-[14px] border border-fb-negative-soft bg-white px-4 py-3 text-[12px] font-bold leading-[1.5] text-fb-negative-ink shadow-card">
          {state.error}
        </div>
      ) : null}
    </>
  )
}
