'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoneyInputRow } from './form-field'
import { Button } from './button'
import { Icon } from './icons'

type LiteValues = {
  income: number
  recur: number
  save: number
}

export function LiteOnboarding({
  token,
  initial,
  prevValues,
  doneHref = '/dashboard',
}: {
  token: string
  initial?: Partial<LiteValues>
  prevValues?: Partial<LiteValues> | null
  doneHref?: string
}) {
  const router = useRouter()
  const [v, setV] = useState<LiteValues>({ income: 380, recur: 180, save: 60, ...initial })
  const [hasPrev] = useState(Boolean(prevValues))

  const set = (key: keyof LiteValues) => (val: number | '') =>
    setV((cur) => ({ ...cur, [key]: typeof val === 'number' ? val : 0 }))

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-fb-page">
      {/* nav */}
      <div className="flex items-center justify-between border-b border-fb-line bg-white/85 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push(`/invite/${token}`)}
          aria-label="뒤로"
          className="fbpress flex size-9 items-center justify-center rounded-full text-fb-ink hover:bg-fb-card-alt"
        >
          <Icon name="chevron-left" className="size-[22px]" />
        </button>
        <div className="text-[14px] font-semibold text-fb-ink">민호님 체크인</div>
        <span className="size-9" />
      </div>

      <div className="flex-1 overflow-auto px-5 pb-[140px] pt-6">
        <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
          2026. 04. 체크인
        </div>
        <h1 className="text-[24px] font-bold leading-[1.30] tracking-[-0.020em] text-fb-ink">
          민호님 숫자<br />3가지만 알려주세요.
        </h1>
        <p className="mt-3 text-[14px] font-medium leading-[1.55] text-fb-ink-2">
          지윤님께는 합산 결과만 보여요.<br />
          평소 평균이면 충분해요.
        </p>

        {hasPrev ? (
          <button
            type="button"
            onClick={() => {
              if (prevValues) setV({ income: prevValues.income ?? 0, recur: prevValues.recur ?? 0, save: prevValues.save ?? 0 })
              router.push(doneHref)
            }}
            className="fbpress mt-6 flex w-full items-center gap-3 rounded-[16px] border border-fb-trust bg-white p-4 text-left"
          >
            <span className="flex size-10 items-center justify-center rounded-[12px] bg-fb-trust-soft text-fb-trust-ink">
              <Icon name="refresh" className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-fb-ink">지난달과 같아요</span>
              <span className="mt-0.5 block text-[12px] font-medium text-fb-ink-3">
                3월 입력값 그대로 사용
              </span>
            </span>
            <Icon name="chevron-right" className="size-5 text-fb-ink-3" />
          </button>
        ) : null}

        {hasPrev ? (
          <div className="my-5 flex items-center gap-2.5">
            <span className="h-px flex-1 bg-fb-line" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
              또는 새로 입력
            </span>
            <span className="h-px flex-1 bg-fb-line" />
          </div>
        ) : (
          <div className="mt-6" />
        )}

        <div className="flex flex-col gap-4">
          <MoneyInputRow
            label="내 세후 월수입"
            value={v.income}
            onValueChange={set('income')}
            hint="대략 평균이면 돼요."
          />
          <MoneyInputRow
            label="내 월 반복지출"
            value={v.recur}
            onValueChange={set('recur')}
            hint="고정비 + 변동비 합. 정확하지 않아도 괜찮아요."
          />
          <MoneyInputRow
            label="내 월 정기저축 / 투자"
            value={v.save}
            onValueChange={set('save')}
            hint="자동이체로 빠져나가는 금액."
          />
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-[16px] bg-fb-card-alt p-4">
          <Icon name="lock" className="mt-0.5 size-[18px] text-fb-ink-2" />
          <span className="text-[13px] font-medium leading-[1.55] text-fb-ink-2">
            <b className="font-bold text-fb-ink">지윤님은 개별 숫자를 볼 수 없어요.</b>
            <br />
            합산된 우리 가족 결과만 함께 봐요.
          </span>
        </div>
      </div>

      {/* sticky CTA */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-fb-page/0 via-fb-page/92 to-fb-page px-5 pb-7 pt-3">
        <Button
          variant="inverse"
          size="lg"
          full
          href={doneHref}
          iconRight={<Icon name="chevron-right" className="size-[18px]" />}
        >
          체크인 마치기
        </Button>
      </div>
    </div>
  )
}
