'use client'

import { useMemo, useState } from 'react'
import { compoundMonthly } from '@/lib/fire-calculator'
import { fixedCostItems as initialItems } from '@/lib/sample-data'
import { formatManWon, formatNumber } from '@/lib/format'
import { Button } from './button'
import { MetricCard } from './metric-card'
import { StatusPill } from './status-pill'
import { Icon } from './icons'
import { cn } from '@/lib/cn'

type Item = (typeof initialItems)[number]

export function FixedCostSimulator() {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [periodYears, setPeriodYears] = useState(20)
  const [returnRate, setReturnRate] = useState(5)
  const [monthlyIncomeMan, setMonthlyIncomeMan] = useState(600)
  const [investmentRatio, setInvestmentRatio] = useState(50)

  const result = useMemo(() => {
    const activeTotal = items.filter((item) => item.active).reduce((sum, item) => sum + item.amountMan, 0)
    const reducedAmountMan = Math.min(50, activeTotal)
    const baselineMonthlyInvestmentMan = Math.max(0, monthlyIncomeMan * (investmentRatio / 100) - activeTotal * 0.15)
    const optimizedMonthlyInvestmentMan = baselineMonthlyInvestmentMan + reducedAmountMan
    const baselineFutureMan = compoundMonthly(baselineMonthlyInvestmentMan, periodYears, returnRate / 100)
    const optimizedFutureMan = compoundMonthly(optimizedMonthlyInvestmentMan, periodYears, returnRate / 100)

    return {
      activeTotal,
      reducedAmountMan,
      baselineFutureMan,
      optimizedFutureMan,
      differenceMan: optimizedFutureMan - baselineFutureMan,
      baselineMonthlyInvestmentMan,
      optimizedMonthlyInvestmentMan,
    }
  }, [items, investmentRatio, monthlyIncomeMan, periodYears, returnRate])

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const maxBar = Math.max(result.baselineFutureMan, result.optimizedFutureMan, 1)

  return (
    <div className="space-y-4">
      <section className="fb-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-fb-ink">고정비 시뮬레이터</p>
            <p className="mt-1 text-sm leading-6 text-fb-muted">반복 지출이 미래 자산에 주는 영향을 차분히 확인해요.</p>
          </div>
          <StatusPill label="참고용" status="info" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <NumberControl label="월 실수령액" value={monthlyIncomeMan} onChange={setMonthlyIncomeMan} suffix="만원" />
          <NumberControl label="시뮬레이션 기간" value={periodYears} onChange={setPeriodYears} suffix="년" />
          <NumberControl label="투자 비율" value={investmentRatio} onChange={setInvestmentRatio} suffix="%" />
          <NumberControl label="예상 수익률" value={returnRate} onChange={setReturnRate} suffix="%" />
        </div>
      </section>

      <section className="fb-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-[-0.03em]">월 고정비 항목</h2>
          <span className="text-xs font-bold text-fb-muted">현재 합계 {formatManWon(result.activeTotal)}</span>
        </div>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className={cn('grid grid-cols-[auto_1fr_92px] items-center gap-3 rounded-soft border p-3 transition', item.active ? 'border-fb-line bg-fb-surface' : 'border-fb-line/70 bg-fb-stone/30 text-fb-muted')}>
              <input
                type="checkbox"
                checked={item.active}
                onChange={(event) => updateItem(item.id, { active: event.target.checked })}
                className="size-5 accent-fb-green"
                aria-label={`${item.label} 사용 여부`}
              />
              <span className="text-sm font-semibold">{item.label}</span>
              <label className="relative">
                <input
                  inputMode="numeric"
                  value={item.amountMan}
                  onChange={(event) => updateItem(item.id, { amountMan: Number(event.target.value.replace(/[^0-9]/g, '')) })}
                  className="fb-input h-10 px-3 pr-8 text-right text-sm"
                  aria-label={`${item.label} 금액`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-fb-muted">만</span>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="fb-card overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold tracking-[-0.03em]">고정비를 줄이면 달라지는 미래 자산</h2>
            <p className="mt-1 text-sm leading-6 text-fb-muted">현재 고정비에서 {formatManWon(result.reducedAmountMan)}을 줄여 투자한다고 가정했어요.</p>
          </div>
          <StatusPill label={`${periodYears}년 후`} status="positive" />
        </div>

        <div className="relative mt-6 h-48 overflow-hidden rounded-card bg-fb-green-50 p-5">
          <div className="absolute inset-x-5 top-5 flex items-center justify-between text-xs font-bold text-fb-muted">
            <span>현재</span>
            <span>고정비 -{formatNumber(result.reducedAmountMan)}만원</span>
          </div>
          <div className="flex h-full items-end justify-center gap-12 pt-8">
            <Bar label="현재" value={result.baselineFutureMan} height={(result.baselineFutureMan / maxBar) * 100} muted />
            <Bar label="조정 후" value={result.optimizedFutureMan} height={(result.optimizedFutureMan / maxBar) * 100} />
          </div>
          <div className="absolute right-6 top-1/2 rounded-full bg-white px-3 py-2 text-xs font-bold text-fb-green shadow-card">+{formatManWon(result.differenceMan)}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricCard title="미래 자산 차이" value={formatManWon(result.differenceMan)} delta="절감액을 투자한 가정" variant="positive" size="sm" />
          <MetricCard title="월 투자 여력" value={formatManWon(result.optimizedMonthlyInvestmentMan)} delta={`현재 대비 +${formatNumber(result.reducedAmountMan)}만원`} variant="positive" size="sm" />
        </div>

        <div className="mt-4 flex gap-3 rounded-soft bg-fb-sand/70 p-4 text-sm leading-6 text-fb-ink">
          <Icon name="leaf" className="mt-0.5 size-5 shrink-0 text-fb-green" />
          <p>돈이 샌다는 표현보다, 반복 지출을 조정하면 두 사람이 선택할 수 있는 미래가 넓어진다는 방식으로 보여줍니다.</p>
        </div>

        <Button className="mt-4 w-full">결과 공유하기</Button>
      </section>
    </div>
  )
}

function NumberControl({ label, value, suffix, onChange }: { label: string; value: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-fb-muted">{label}</span>
      <div className="relative">
        <input
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Number(event.target.value.replace(/[^0-9]/g, '')))}
          className="fb-input h-11 px-3 pr-10 text-right"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-fb-muted">{suffix}</span>
      </div>
    </label>
  )
}

function Bar({ label, value, height, muted = false }: { label: string; value: number; height: number; muted?: boolean }) {
  return (
    <div className="flex h-full w-24 flex-col items-center justify-end gap-2">
      <p className="text-sm font-bold tracking-[-0.03em] text-fb-ink">{formatManWon(value)}</p>
      <div className={muted ? 'w-full rounded-t-xl bg-fb-slate/30' : 'w-full rounded-t-xl bg-fb-green shadow-card'} style={{ height: `${Math.max(18, height)}%` }} />
      <p className="text-xs font-bold text-fb-muted">{label}</p>
    </div>
  )
}
