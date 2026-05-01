'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Card, SectionHeader } from './card'
import { Icon } from './icons'
import { StatusPill } from './status-pill'

type Item = {
  id: string
  name: string
  cat: string
  amount: number // 만원/월
  on: boolean
}

const initialItems: Item[] = [
  { id: 'netflix', name: 'Netflix 프리미엄', cat: '구독', amount: 1.7, on: true },
  { id: 'tving', name: 'TVING + Disney+', cat: '구독', amount: 2.3, on: true },
  { id: 'gym', name: '필라테스', cat: '운동', amount: 18, on: true },
  { id: 'phone', name: '통신비 (2인)', cat: '통신', amount: 14, on: true },
  { id: 'insure', name: '실손보험', cat: '보험', amount: 9.8, on: true },
  { id: 'coffee', name: '주 3회 카페 정기', cat: '식비', amount: 12, on: false },
]

const YEARS = 10
const ANNUAL_RETURN = 0.05

export function FixedCostSimulator() {
  const [items, setItems] = useState<Item[]>(initialItems)

  const { total, direct, fv, monthsSaved } = useMemo(() => {
    const total = items.filter((i) => i.on).reduce((a, b) => a + b.amount, 0)
    const direct = total * 12 * YEARS
    const r = ANNUAL_RETURN / 12
    const n = 12 * YEARS
    const fv = total === 0 ? 0 : total * ((Math.pow(1 + r, n) - 1) / r)
    // Months-saved-on-FIRE: rough — invested fv applied to remaining gap to FIRE
    const monthsSaved = Math.round(fv / 200) // simple proxy
    return { total, direct, fv, monthsSaved }
  }, [items])

  const toggle = (id: string) =>
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, on: !i.on } : i)))

  const activeCount = items.filter((i) => i.on).length

  return (
    <div className="space-y-5">
      {/* Hero comparison */}
      <Card radius="hero" className="p-6">
        <div className="text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
          {YEARS}년 후 차이
        </div>

        <div className="mt-3 flex flex-col gap-3.5">
          {/* Now path */}
          <div>
            <div className="mb-1 text-[12px] font-semibold text-fb-ink-2">지금처럼 쓰면</div>
            <div className="fb-num flex items-baseline gap-1">
              <span className="text-[16px] font-bold text-fb-ink-3">−</span>
              <span className="text-[32px] font-bold tracking-[-0.020em] text-fb-ink">
                {Math.round(direct).toLocaleString('ko-KR')}
              </span>
              <span className="text-[14px] font-bold text-fb-ink-2">만원</span>
            </div>
          </div>

          <div className="self-start rounded-full bg-fb-card-mute px-2.5 py-1 text-[11px] font-semibold tracking-[0.012em] text-fb-ink-2">
            대신 5% 수익률로 투자하면
          </div>

          {/* Invested path */}
          <div>
            <div className="mb-1 text-[12px] font-semibold text-fb-trust">10년 뒤 투자 예상액</div>
            <div className="fb-num flex items-baseline gap-1">
              <span className="text-[16px] font-bold text-fb-trust">+</span>
              <span className="text-[36px] font-bold tracking-[-0.024em] text-fb-trust">
                {Math.round(fv).toLocaleString('ko-KR')}
              </span>
              <span className="text-[14px] font-bold text-fb-trust-ink">만원</span>
            </div>
            {monthsSaved > 0 ? (
              <div className="mt-1.5 text-[12px] font-medium text-fb-ink-3">
                FIRE까지{' '}
                <b className="fb-num font-bold text-fb-trust">
                  약 {Math.floor(monthsSaved / 12)}년 {monthsSaved % 12}개월
                </b>{' '}
                단축
              </div>
            ) : null}
          </div>
        </div>

        {/* mini bar comparison */}
        <div className="mt-5 flex h-14 items-end gap-2.5">
          <div className="flex-1">
            <div
              className="rounded-[6px] bg-fb-line-strong"
              style={{ height: fv > 0 ? `${Math.min(56, (56 * direct) / fv)}px` : 0 }}
            />
            <div className="fb-num mt-1.5 text-[10px] font-semibold text-fb-ink-3">소비 누적</div>
          </div>
          <div className="flex-1">
            <div
              className="rounded-[6px] bg-gradient-to-b from-fb-trust to-[#3385FF]"
              style={{ height: '56px' }}
            />
            <div className="fb-num mt-1.5 text-[10px] font-semibold text-fb-trust">투자 결과</div>
          </div>
        </div>
      </Card>

      {/* params */}
      <div className="grid grid-cols-2 gap-2.5">
        <ParamPill label="기간" value={`${YEARS}년`} />
        <ParamPill label="수익률" value={`연 ${ANNUAL_RETURN * 100}%`} />
      </div>

      {/* monthly total */}
      <Card className="flex items-center justify-between p-4">
        <div>
          <div className="text-[12px] font-medium text-fb-ink-3">이번 달 활성 고정비</div>
          <div className="fb-num mt-0.5 text-[22px] font-bold tracking-[-0.012em] text-fb-ink">
            {total.toFixed(1)}{' '}
            <span className="text-[13px] font-semibold text-fb-ink-3">만원 / 월</span>
          </div>
        </div>
        <StatusPill tone="trust">{activeCount}개 활성</StatusPill>
      </Card>

      {/* item list */}
      <section className="space-y-3">
        <SectionHeader
          title="반복 지출"
          subtitle="끄거나 켜서 미래 자산이 어떻게 달라지는지 봐요"
        />
        <Card className="px-1 py-1">
          {items.map((item, i) => (
            <div key={item.id}>
              <SubRow item={item} onToggle={() => toggle(item.id)} />
              {i < items.length - 1 ? <div className="ml-14 h-px bg-fb-line-soft" /> : null}
            </div>
          ))}
        </Card>
        <button
          type="button"
          className="fbpress flex h-12 w-full items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-fb-line-strong bg-white text-[14px] font-semibold text-fb-ink-2"
        >
          <Icon name="plus" className="size-[18px]" />
          항목 추가
        </button>
      </section>
    </div>
  )
}

function ParamPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[12px] border border-fb-line bg-white px-4 py-3">
      <span className="text-[12px] font-semibold text-fb-ink-3">{label}</span>
      <span className="fb-num text-[14px] font-bold text-fb-ink">{value}</span>
    </div>
  )
}

function SubRow({ item, onToggle }: { item: Item; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-[10px]',
          item.on ? 'bg-fb-trust-soft text-fb-trust-ink' : 'bg-fb-card-mute text-fb-ink-3',
        )}
      >
        <span className="text-[11px] font-bold">{item.cat}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-[14px] font-semibold',
            item.on ? 'text-fb-ink' : 'text-fb-ink-3 line-through',
          )}
        >
          {item.name}
        </div>
        <div className="fb-num mt-0.5 text-[12px] font-medium text-fb-ink-3">
          {item.amount} 만원 / 월
        </div>
      </div>
      <Toggle on={item.on} onClick={onToggle} />
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'relative h-[26px] w-11 shrink-0 rounded-full transition-[background] duration-150 ease-out',
        on ? 'bg-fb-trust' : 'bg-[#DBDCDF]',
      )}
    >
      <span
        className="absolute top-[3px] size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-[left] duration-150 ease-out"
        style={{ left: on ? 21 : 3 }}
      />
    </button>
  )
}
