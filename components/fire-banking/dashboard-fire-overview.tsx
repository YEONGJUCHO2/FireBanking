'use client'

import { useState } from 'react'
import { FireHeroCard } from './fire-hero-card'
import type { FireDisplayMode } from './fire-timeline'
import { NetWorthHero } from './networth-hero'

type DashboardFireOverviewProps = {
  percent: number
  targetMonthlyExpenseManWon: number
  fireNetWorthManWon: number
  monthlyGrowthManWon: number
  fireTargetManWon: number
  years: number
  months: number
}

export function DashboardFireOverview({
  percent,
  targetMonthlyExpenseManWon,
  fireNetWorthManWon,
  monthlyGrowthManWon,
  fireTargetManWon,
  years,
  months,
}: DashboardFireOverviewProps) {
  const [displayMode, setDisplayMode] = useState<FireDisplayMode>('amount')

  return (
    <>
      <NetWorthHero
        targetMonthlyExpenseManWon={targetMonthlyExpenseManWon}
        fireNetWorthManWon={fireNetWorthManWon}
        monthlyGrowthManWon={monthlyGrowthManWon}
        fireTargetManWon={fireTargetManWon}
        years={years}
        months={months}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
      />

      <div className="mt-4">
        <FireHeroCard
          percent={percent}
          years={years}
          months={months}
          goalManWon={fireTargetManWon}
          coastManWon={Math.round(fireTargetManWon * 0.55)}
          displayMode={displayMode}
        />
      </div>
    </>
  )
}
