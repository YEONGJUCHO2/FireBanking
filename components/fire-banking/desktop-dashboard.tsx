import { dashboardMetrics } from '@/lib/sample-data'
import { formatManWon } from '@/lib/format'
import { BrandLockup } from './brand'
import { Button } from './button'
import { CashflowSummary } from './cashflow-summary'
import { FireHeroCard } from './fire-hero-card'
import { MetricCard } from './metric-card'
import { Icon, type IconName } from './icons'
import type { ReactNode } from 'react'
import Link from 'next/link'

const sidebar: Array<{ label: string; icon: IconName; href: string }> = [
  { label: '대시보드', icon: 'home', href: '/dashboard' },
  { label: '기록', icon: 'calendar', href: '/onboarding' },
  { label: '고정비 계산', icon: 'chart', href: '/subscribe' },
  { label: '설계 도구', icon: 'mountain', href: '/subscribe' },
  { label: '배우자 관리', icon: 'users', href: '/invite/demo-token' },
  { label: '설정', icon: 'settings', href: '/design-system' },
]

export function DesktopDashboard({ footerAction }: { footerAction?: ReactNode }) {
  const m = dashboardMetrics
  const remainingAfterRegular = m.monthlyIncomeMan - m.monthlyLivingCostMan - m.monthlyRegularInvestmentMan

  return (
    <section className="mx-auto hidden w-full max-w-6xl rounded-[2rem] border border-fb-line bg-fb-surface p-3 shadow-soft lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="rounded-[1.5rem] bg-fb-bg p-5">
        <BrandLockup compact />
        <nav className="mt-8 space-y-1 text-sm font-bold text-fb-muted">
          {sidebar.map((item) => (
            <Link key={item.label} href={item.href} className={item.label === '대시보드' ? 'flex items-center gap-3 rounded-soft bg-fb-green-100 px-3 py-3 text-fb-green' : 'flex items-center gap-3 rounded-soft px-3 py-3 transition hover:bg-fb-green-50 hover:text-fb-green'}>
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 rounded-card border border-fb-line bg-white p-4 text-sm leading-6 text-fb-muted">
          <p className="font-bold text-fb-ink">우리 부부</p>
          <p>월 체크인 진행 중</p>
        </div>
        {footerAction ? <div className="mt-4">{footerAction}</div> : null}
      </aside>
      <div className="p-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-normal">대시보드</h2>
            <p className="mt-1 text-sm text-fb-muted">월 1회, 같은 숫자로 확인하는 경제적 자유 진척</p>
          </div>
          <Button variant="secondary" size="sm">2026년 4월 요약</Button>
        </div>

        <div className="mt-6 grid grid-cols-[1.2fr_1fr_1fr] gap-4">
          <FireHeroCard dateLabel={m.expectedFireDateLabel} distanceLabel={m.expectedFireDistanceLabel} compact />
          <MetricCard title="표시 순자산" value={formatManWon(m.displayNetWorthMan)} delta={`전월 대비 ${formatManWon(m.displayNetWorthDeltaMan, { signed: true })}`} variant="positive" />
          <MetricCard title="FIRE 계산 순자산" value={formatManWon(m.fireNetWorthMan)} delta={`전월 대비 ${formatManWon(m.fireNetWorthDeltaMan, { signed: true })}`} variant="positive" />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1fr_1fr_280px] gap-4">
          <MetricCard title="월 자산 증가 여력" value={formatManWon(m.monthlyAssetGrowthCapacityMan)} caption="수입에서 생활비를 제외한 여력" />
          <MetricCard title="FIRE 목표 자산" value={formatManWon(m.fireTargetAssetMan)} caption="월 생활비 × 12 × 25배" />
          <div className="fb-card p-5">
            <p className="text-sm font-bold text-fb-muted">월 생활비</p>
            <p className="mt-3 text-3xl font-bold tracking-normal text-fb-ink">{formatManWon(m.monthlyLivingCostMan)}</p>
            <p className="mt-2 text-sm leading-6 text-fb-muted">고정비 + 변동비 기준</p>
            <Button href="/subscribe" variant="secondary" size="sm" className="mt-4 w-full whitespace-nowrap px-2 text-xs">고정비 계산하기</Button>
          </div>
          <div className="fb-card p-5">
            <p className="text-sm font-bold text-fb-ink">배우자 현황</p>
            <p className="mt-2 text-sm leading-6 text-fb-muted">배우자가 아직 참여하지 않았어요. 초대하면 이번 달 결과가 더 정확해져요.</p>
            <Button href="/invite/demo-token" className="mt-4 w-full" size="sm">초대하기</Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_320px] gap-4">
          <CashflowSummary incomeMan={m.monthlyIncomeMan} livingCostMan={m.monthlyLivingCostMan} regularInvestmentMan={m.monthlyRegularInvestmentMan} remainingMan={remainingAfterRegular} compact />
          <section className="fb-card p-5">
            <h3 className="text-sm font-bold text-fb-ink">진척 추이</h3>
            <div className="mt-5 flex h-28 items-end gap-2 border-b border-l border-fb-line pl-2">
              {[28, 34, 38, 46, 55, 66, 72, 84].map((height, index) => (
                <div key={index} className="w-full rounded-t bg-fb-green/80" style={{ height: `${height}%` }} />
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-fb-muted">FIRE 계산 순자산 기준의 월별 흐름입니다.</p>
          </section>
        </div>
      </div>
    </section>
  )
}
