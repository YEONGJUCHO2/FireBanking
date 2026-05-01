'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Icon } from './icons'
import { StatusPill } from './status-pill'

export type OnboardingValues = {
  income: number
  fixed: number
  variable: number
  save: number
  investable: number
  home: number
  other: number
}

type StepKey = keyof OnboardingValues

type Step = {
  key: StepKey
  group: string
  groupIdx: number
  groupOf: number
  title: string
  sub: string
  helper: string
  shortLabel: string
  optional?: boolean
}

const STEPS: Step[] = [
  {
    key: 'income',
    group: '내 캐시플로우',
    groupIdx: 1,
    groupOf: 3,
    title: '내 세후 월수입은\n얼마나 되나요?',
    sub: '본인 기준이에요.\n배우자 분은 초대 후 따로 입력하면 합산돼요.',
    helper: '보너스는 12개월로 나눠 평균값을 넣어도 좋아요.',
    shortLabel: '내 세후 월수입',
  },
  {
    key: 'fixed',
    group: '내 캐시플로우',
    groupIdx: 1,
    groupOf: 3,
    title: '내가 책임지는\n월 고정비는요?',
    sub: '내 명의 구독·보험·통신비처럼\n매달 비슷하게 빠져나가는 지출.',
    helper: '공과금/관리비는 분담분만 적어주세요.',
    shortLabel: '내 월 고정비',
  },
  {
    key: 'variable',
    group: '내 캐시플로우',
    groupIdx: 1,
    groupOf: 3,
    title: '내 평소 한 달\n변동비는 얼마쯤이죠?',
    sub: '식비, 외식, 쇼핑처럼 그때그때 다른 지출.\n본인 카드/계좌 기준이에요.',
    helper: '평균이면 충분해요.',
    shortLabel: '내 월 변동비',
  },
  {
    key: 'save',
    group: '내 캐시플로우',
    groupIdx: 1,
    groupOf: 3,
    title: '매달 내가 저축·투자로\n빠져나가는 돈은요?',
    sub: '본인 명의 자동이체 합계.\n비상금 적립도 포함해 주세요.',
    helper: '아직 없으면 0으로 두셔도 괜찮아요.',
    shortLabel: '내 월 저축·투자',
  },
  {
    key: 'investable',
    group: '가구 공동 자산',
    groupIdx: 2,
    groupOf: 3,
    title: '투자가능 순자산은\n부부 합쳐서 얼마쯤?',
    sub: '현금성 + 투자 자산을 부부 합산으로요.\nFIRE 거리감 계산의 핵심 숫자예요.',
    helper: '대출/카드 미결제는 빼고 적어주세요.',
    shortLabel: '가구 투자가능 순자산',
  },
  {
    key: 'home',
    group: '가구 공동 자산',
    groupIdx: 2,
    groupOf: 3,
    title: '거주 부동산\n순자산이 있어요?',
    sub: '시세에서 대출을 뺀 값.\n표시 순자산엔 포함되지만 FIRE 계산엔 빠져요.',
    helper: '없거나 잘 모르면 건너뛰어도 돼요.',
    shortLabel: '거주 부동산 순자산',
    optional: true,
  },
  {
    key: 'other',
    group: '가구 공동 자산',
    groupIdx: 2,
    groupOf: 3,
    title: '기타 자산도\n있을까요?',
    sub: '자동차, 보증금처럼 환금성 낮은 자산.\n부부 합쳐서요.',
    helper: '없으면 건너뛰어도 좋아요.',
    shortLabel: '기타 자산',
    optional: true,
  },
]

const DEFAULT_VALUES: OnboardingValues = {
  income: 0,
  fixed: 0,
  variable: 0,
  save: 0,
  investable: 0,
  home: 0,
  other: 0,
}

export function OnboardingStepper({
  initial,
  prevValues,
  doneHref = '/dashboard',
  backOutHref = '/',
  onDone,
}: {
  initial?: Partial<OnboardingValues>
  prevValues?: Partial<OnboardingValues> | null
  doneHref?: string
  backOutHref?: string
  onDone?: (values: OnboardingValues) => void
}) {
  const router = useRouter()
  const [values, setValues] = useState<OnboardingValues>({ ...DEFAULT_VALUES, ...initial })
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState<'fwd' | 'bwd'>('fwd')
  const inputRef = useRef<HTMLInputElement>(null)

  const total = STEPS.length
  const onSummary = idx === total
  const step = STEPS[idx]

  useEffect(() => {
    if (!onSummary && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [idx, onSummary])

  const setVal = (key: StepKey, val: number) => setValues((v) => ({ ...v, [key]: val }))

  const next = () => {
    setDir('fwd')
    setIdx((i) => i + 1)
  }
  const back = () => {
    if (idx === 0) {
      router.push(backOutHref)
      return
    }
    setDir('bwd')
    setIdx((i) => i - 1)
  }

  const finish = () => {
    if (onDone) onDone(values)
    router.push(doneHref)
  }

  const pct = (idx / total) * 100

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-fb-page">
      {/* Top nav */}
      <div className="flex items-center justify-between bg-fb-page/85 px-3 py-3 backdrop-blur">
        <button
          type="button"
          onClick={back}
          aria-label="뒤로"
          className="fbpress flex size-9 items-center justify-center rounded-full text-fb-ink hover:bg-fb-card-alt"
        >
          <Icon name="chevron-left" className="size-[22px]" />
        </button>
        <div className="fb-num text-[13px] font-semibold text-fb-ink-2">
          {idx + 1} <span className="text-fb-ink-4">/ {total + 1}</span>
        </div>
        <span className="size-9" />
      </div>

      {/* Progress */}
      <div className="px-5 pb-2">
        <div className="h-[3px] overflow-hidden rounded-full bg-[#F0F0F2]">
          <div
            className="h-full rounded-full bg-fb-trust transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 pb-[160px] pt-5">
        {onSummary ? (
          <div
            key="summary"
            className={cn(dir === 'fwd' ? 'animate-[fb-step-fwd-in_280ms_cubic-bezier(.2,.8,.2,1)]' : 'animate-[fb-step-bwd-in_280ms_cubic-bezier(.2,.8,.2,1)]')}
          >
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
              마지막 단계
            </div>
            <h1 className="text-[26px] font-bold leading-[1.30] tracking-[-0.022em] text-fb-ink">
              확인하고
              <br />
              결과를 함께 볼까요?
            </h1>
            <p className="mt-3.5 text-[14px] font-medium leading-[1.55] text-fb-ink-2">
              언제든 대시보드에서 다시 고칠 수 있어요.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              {STEPS.map((s, i) => (
                <SummaryRow
                  key={s.key}
                  label={s.shortLabel}
                  value={values[s.key]}
                  optional={s.optional}
                  onClick={() => {
                    setDir('bwd')
                    setIdx(i)
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            key={step.key}
            className={cn(dir === 'fwd' ? 'animate-[fb-step-fwd-in_280ms_cubic-bezier(.2,.8,.2,1)]' : 'animate-[fb-step-bwd-in_280ms_cubic-bezier(.2,.8,.2,1)]')}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
                {step.group} · {step.groupIdx} / {step.groupOf}
              </span>
              {step.optional ? (
                <StatusPill tone="neutral" size="sm">
                  선택
                </StatusPill>
              ) : null}
            </div>

            <h1 className="whitespace-pre-line text-[26px] font-bold leading-[1.30] tracking-[-0.022em] text-fb-ink">
              {step.title}
            </h1>
            <p className="mt-3.5 whitespace-pre-line text-[14px] font-medium leading-[1.55] text-fb-ink-2">
              {step.sub}
            </p>

            <div className="mt-9">
              <BigInput
                inputRef={inputRef}
                value={values[step.key]}
                onChange={(v) => setVal(step.key, v)}
                onSubmit={next}
              />
              <p className="mt-3.5 text-[12px] font-medium leading-[1.55] text-fb-ink-3">{step.helper}</p>

              {prevValues &&
              prevValues[step.key] != null &&
              (Number(values[step.key]) === 0 || values[step.key] === undefined) ? (
                <button
                  type="button"
                  onClick={() => setVal(step.key, Number(prevValues[step.key]))}
                  className="fbpress mt-3.5 inline-flex items-center gap-2 rounded-full border border-fb-line-strong bg-white px-3.5 py-2.5 text-[12px] font-semibold text-fb-ink"
                >
                  <Icon name="refresh" className="size-3.5" />
                  지난달 값 {Number(prevValues[step.key]).toLocaleString('ko-KR')}만원 그대로
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <BottomCta>
        {onSummary ? (
          <button
            type="button"
            onClick={finish}
            className="fbpress flex h-[54px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-fb-ink text-[15px] font-bold tracking-[-0.008em] text-white"
          >
            결과 보기
            <Icon name="chevron-right" className="size-[18px]" />
          </button>
        ) : (
          <div className="flex gap-2.5">
            {step.optional ? (
              <button
                type="button"
                onClick={next}
                className="fbpress h-[54px] shrink-0 rounded-[14px] border border-fb-line-strong bg-white px-[22px] text-[15px] font-semibold text-fb-ink-2"
              >
                건너뛰기
              </button>
            ) : null}
            <button
              type="button"
              onClick={next}
              className="fbpress flex h-[54px] flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-fb-ink text-[15px] font-bold tracking-[-0.008em] text-white"
            >
              다음
              <Icon name="chevron-right" className="size-[18px]" />
            </button>
          </div>
        )}
      </BottomCta>
    </div>
  )
}

function BottomCta({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-fb-page/0 via-fb-page/92 to-fb-page px-5 pb-7 pt-3.5">
      {children}
    </div>
  )
}

function BigInput({
  value,
  onChange,
  onSubmit,
  inputRef,
}: {
  value: number
  onChange: (v: number) => void
  onSubmit?: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const [focused, setFocused] = useState(false)
  const display = value === 0 ? '' : value.toLocaleString('ko-KR')
  const placeholder = '0'

  return (
    <div
      className={cn(
        'flex items-baseline justify-center gap-2 rounded-[20px] border bg-white px-5 py-6 transition-all duration-200',
        focused
          ? 'border-fb-trust shadow-[0_0_0_4px_rgba(0,102,255,0.12)]'
          : 'border-fb-line shadow-none',
      )}
    >
      <input
        ref={inputRef}
        inputMode="numeric"
        type="text"
        value={display}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit?.()
          }
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '')
          onChange(raw === '' ? 0 : Number(raw))
        }}
        placeholder={placeholder}
        className="fb-num shrink-0 grow-0 border-none bg-transparent p-0 text-right text-[44px] font-bold tracking-[-0.024em] text-fb-ink outline-none"
        style={{ width: `${Math.max(2, display.length || placeholder.length)}ch` }}
      />
      <span className="text-[18px] font-bold text-fb-ink-3">만원</span>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  optional,
  onClick,
}: {
  label: string
  value: number
  optional?: boolean
  onClick: () => void
}) {
  const empty = !value
  return (
    <button
      type="button"
      onClick={onClick}
      className="fbpress flex w-full items-center gap-3 rounded-[14px] border border-fb-line bg-white px-4 py-3.5 text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-fb-ink-2">{label}</div>
        <div
          className={cn(
            'fb-num mt-0.5 text-[18px] font-bold tracking-[-0.012em]',
            empty ? 'text-fb-ink-4' : 'text-fb-ink',
          )}
        >
          {empty ? (optional ? '건너뜀' : '0') : value.toLocaleString('ko-KR')}
          {!empty ? <span className="ml-1 text-[12px] font-semibold text-fb-ink-3">만원</span> : null}
        </div>
      </div>
      <Icon name="chevron-right" className="size-4 text-fb-ink-4" />
    </button>
  )
}
