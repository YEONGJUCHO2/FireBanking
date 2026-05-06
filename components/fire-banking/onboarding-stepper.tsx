'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Icon } from './icons'
import { StatusPill } from './status-pill'
import { suggestFireMonthlyExpenseFromSpending } from '@/src/features/fire/lib/suggestFireMonthlyExpense'

export type OnboardingValues = {
  goalExpense: number
  income: number
  totalExpense: number
  investable: number
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
    key: 'totalExpense',
    group: '가구 캐시플로우',
    groupIdx: 1,
    groupOf: 3,
    title: '한 달 총지출은\n얼마쯤인가요?',
    sub: '지금 생활의 기준점부터 잡아요.\n고정비와 변동비를 나누지 않고 총액만 입력해도 됩니다.',
    helper: '정확한 가계부보다 첫 FIRE 거리감을 보는 것이 먼저입니다.',
    shortLabel: '월 총지출',
  },
  {
    key: 'goalExpense',
    group: 'FIRE 기준 설정',
    groupIdx: 2,
    groupOf: 3,
    title: '은퇴 후 생활비 기준은\n이렇게 잡을게요',
    sub: '방금 입력한 한 달 총지출을 기본값으로 넣어뒀어요.\n더 줄이거나 늘리고 싶으면 여기서 직접 바꿀 수 있습니다.',
    helper: '이 금액 × 12 × 25배가 첫 FIRE 목표자산입니다.',
    shortLabel: '은퇴 후 월 생활비',
  },
  {
    key: 'income',
    group: '가구 캐시플로우',
    groupIdx: 2,
    groupOf: 3,
    title: '세후 월수입은\n얼마나 되나요?',
    sub: '가구 기준으로 빠르게 시작해요.\n배우자 분은 초대 후 3개 숫자를 따로 입력할 수 있어요.',
    helper: '보너스는 12개월로 나눠 평균값을 넣어도 좋아요.',
    shortLabel: '세후 월수입',
  },
  {
    key: 'investable',
    group: 'FIRE 자산',
    groupIdx: 3,
    groupOf: 3,
    title: '내가 확인 가능한\n투자가능 자산은요?',
    sub: '현금성 자산, 주식, ETF처럼 FIRE 생활비를 만들 수 있는 자산이에요.\n배우자 몫은 초대 후 따로 받거나 확인 요청할 수 있어요.',
    helper: '부동산과 기타자산은 나중에 자산 관리 총괄에서 따로 정리해요.',
    shortLabel: '내 투자가능 순자산',
  },
]

const DEFAULT_VALUES: OnboardingValues = {
  goalExpense: 0,
  income: 0,
  totalExpense: 0,
  investable: 0,
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
  const [showResultBridge, setShowResultBridge] = useState(false)
  const [shareNotice, setShareNotice] = useState<string | null>(null)
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
  const suggestedGoalExpense = suggestFireMonthlyExpenseFromSpending(values.totalExpense)

  const next = () => {
    setDir('fwd')
    const nextStep = STEPS[idx + 1]
    if (step?.key === 'totalExpense' && nextStep?.key === 'goalExpense' && values.goalExpense === 0) {
      setVal('goalExpense', suggestedGoalExpense)
    }
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
    setShowResultBridge(true)
  }

  const goToDashboard = () => router.push(doneHref)
  const openFixedCostSimulator = () => router.push('/subscribe?returnTo=/onboarding')

  const shareSpouseRequest = async () => {
    const shareUrl =
      typeof window === 'undefined' ? undefined : new URL('/onboarding', window.location.origin).toString()
    const shareData = {
      title: 'Fire Banking 배우자 입력 요청',
      text: 'Fire Banking에서 우리 FIRE 결과를 더 정확히 보려고 해요. 세후 수입, 월 지출, 투자가능 자산 3개 숫자만 입력해 주세요.',
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch {
      // Some desktop and in-app browsers expose Web Share but reject it.
    }

    try {
      if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareUrl}`)
        setShareNotice('공유창을 열 수 없어 요청 문구를 복사했어요.')
        return
      }
    } catch {
      // Fall through to visible manual guidance below.
    }

    setShareNotice('공유창을 열 수 없어요. 배우자에게 세후 수입, 월 지출, 투자가능 자산 3개 숫자를 부탁해 주세요.')
  }

  const pct = (idx / total) * 100

  if (showResultBridge) {
    return (
      <FireResultBridge
        values={values}
        onInvite={shareSpouseRequest}
        onDashboard={goToDashboard}
        shareNotice={shareNotice}
      />
    )
  }

  return (
    <div data-od-id="stepper" className="relative flex h-full flex-1 flex-col overflow-hidden bg-fb-page">
      {/* Top nav */}
      <div className="flex items-center justify-between bg-fb-page/85 px-3 py-3 backdrop-blur">
        <button
          type="button"
          onClick={back}
          aria-label="뒤로"
          className="fbpress flex size-11 items-center justify-center rounded-full text-fb-ink hover:bg-fb-card-alt"
        >
          <Icon name="chevron-left" className="size-[22px]" />
        </button>
        <div className="fb-num text-[13px] font-semibold text-fb-ink-2">
          {idx + 1} <span className="text-fb-ink-4">/ {total + 1}</span>
        </div>
        <span className="size-11" />
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
              목표 생활비와 투자가능 자산 기준으로 첫 FIRE 거리감을 계산해요.
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
            data-od-id="step-active"
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
                odId={stepKeyToOdId(step.key)}
                inputRef={inputRef}
                value={values[step.key]}
                onChange={(v) => setVal(step.key, v)}
                onSubmit={next}
              />
              <p className="mt-3.5 text-[12px] font-medium leading-[1.55] text-fb-ink-3">{step.helper}</p>

              {step.key === 'goalExpense' && values.totalExpense > 0 ? (
                <p className="mt-3 text-[12px] font-semibold leading-[1.55] text-fb-trust">
                  월 총지출 {values.totalExpense.toLocaleString('ko-KR')}만원에 10% 버퍼를 더해{' '}
                  {suggestedGoalExpense.toLocaleString('ko-KR')}만원을 먼저 넣어뒀어요.
                </p>
              ) : null}

              {step.key === 'totalExpense' ? <SimulatorChoicePanel onOpen={openFixedCostSimulator} /> : null}

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
            data-od-id="cta-primary"
            type="button"
            onClick={finish}
            className="fbpress flex h-[54px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-fb-ink text-[15px] font-bold tracking-[-0.008em] text-white"
          >
            결과 보기
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
              data-od-id="cta-primary"
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

function FireResultBridge({
  values,
  onInvite,
  onDashboard,
  shareNotice,
}: {
  values: OnboardingValues
  onInvite: () => void
  onDashboard: () => void
  shareNotice?: string | null
}) {
  const targetAssetManWon = values.goalExpense * 12 * 25
  const remainingManWon = Math.max(0, targetAssetManWon - values.investable)

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-fb-page px-6 pb-8 pt-14">
      <div className="text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
        첫 FIRE 결과
      </div>
      <h1 className="mt-3 text-[28px] font-bold leading-[1.28] tracking-[-0.024em] text-fb-ink">
        지금 숫자로 본
        <br />
        경제적 자유 거리
      </h1>

      <div className="mt-8 rounded-[22px] border border-fb-line bg-white p-5">
        <p className="text-[14px] font-bold leading-[1.55] text-fb-ink">
          월 {values.goalExpense.toLocaleString('ko-KR')}만원으로 살려면 FIRE 기준은 {formatKoreanEok(targetAssetManWon)}이에요.
        </p>
        <p className="mt-3 text-[14px] font-medium leading-[1.55] text-fb-ink-2">
          현재 투자가능 순자산 기준으로는 {formatKoreanEok(remainingManWon)} 남았습니다.
        </p>
        <p className="mt-4 rounded-[14px] bg-fb-trust-soft px-4 py-3 text-[13px] font-medium leading-[1.55] text-fb-trust-ink">
          배우자 숫자 3개가 더해지면 우리 가족 기준으로 더 정확해져요.
        </p>
      </div>

      <p className="mt-4 text-[12px] font-medium leading-5 text-fb-ink-3">
        참고용 단순 시뮬레이션이며 연 5%, 25배 룰 기준입니다. 투자 자문이 아닙니다.
      </p>

      <div className="flex-1" />

      <div className="grid gap-2.5">
        <button
          type="button"
          onClick={onInvite}
          className="fbpress flex h-[54px] w-full items-center justify-center rounded-[14px] bg-fb-ink text-[15px] font-bold text-white"
        >
          배우자에게 3개 숫자 부탁하기
        </button>
        {shareNotice ? (
          <p className="rounded-[12px] bg-fb-trust-soft px-4 py-3 text-center text-[12px] font-semibold leading-5 text-fb-trust-ink">
            {shareNotice}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onDashboard}
          className="fbpress flex h-[52px] w-full items-center justify-center rounded-[14px] border border-fb-line-strong bg-white text-[15px] font-semibold text-fb-ink"
        >
          대시보드 먼저 보기
        </button>
      </div>
    </div>
  )
}

function formatKoreanEok(valueManWon: number) {
  const eok = Math.floor(valueManWon / 10_000)
  const remainder = valueManWon % 10_000

  if (remainder === 0) {
    return `${eok.toLocaleString('ko-KR')}억원`
  }

  return `${eok.toLocaleString('ko-KR')}억 ${remainder.toLocaleString('ko-KR')}만원`
}

function SimulatorChoicePanel({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fbpress mt-4 flex w-full items-center justify-between rounded-[16px] border border-fb-trust-soft bg-fb-trust-soft px-4 py-3 text-left"
    >
      <span>
        <span className="block text-[13px] font-bold text-fb-trust-ink">고정비 시뮬레이터로 더 정확히 보기</span>
        <span className="mt-0.5 block text-[12px] font-medium text-fb-trust-ink/75">
          반복 지출을 쪼개서 목표 월 생활비를 잡아요
        </span>
      </span>
      <Icon name="chevron-right" className="size-4 text-fb-trust" />
    </button>
  )
}

function BottomCta({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-fb-page/0 via-fb-page/92 to-fb-page px-5 pb-7 pt-3.5">
      {children}
    </div>
  )
}

function stepKeyToOdId(key: StepKey): string {
  const map: Record<StepKey, string> = {
    totalExpense: 'input-monthly-expense',
    goalExpense: 'input-monthly-living-expense',
    income: 'input-monthly-income',
    investable: 'input-net-worth',
  }
  return map[key]
}

function BigInput({
  value,
  onChange,
  onSubmit,
  inputRef,
  odId,
}: {
  value: number
  onChange: (v: number) => void
  onSubmit?: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  odId?: string
}) {
  const [focused, setFocused] = useState(false)
  const display = value === 0 ? '' : value.toLocaleString('ko-KR')
  const placeholder = '0'

  return (
    <div
      data-od-id={odId}
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
