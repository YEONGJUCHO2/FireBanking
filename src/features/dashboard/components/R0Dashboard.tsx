import { formatKrw, formatMonth } from "@/src/lib/format";
import { Card, CashflowSummary, FireHeroCard, MetricCard, StatusPill } from "@/components/fire-banking";

type R0Snapshot = {
  month: string;
  total_income: number;
  investable_net_worth: number;
  primary_residence_net_worth: number;
  other_net_worth: number;
  total_net_worth_for_display: number;
  fire_calculation_net_worth: number;
  fixed_expense: number;
  variable_expense: number;
  regular_investment: number;
  remaining_cash: number;
  monthly_asset_growth_capacity: number;
  annual_fire_expense: number;
  fire_target_asset: number;
  projected_fire_date: string | null;
};

type AssetSnapshotSummary = {
  mode: "current_estimate" | "fixed_month_end";
  snapshotMonth: string;
  snapshotDate: string | null;
  valuationDate: string | null;
  displayedNetWorth: number;
  fireCalculationNetWorth: number;
  investmentAssetAmount: number;
  totalLiabilityAmount: number;
  monthlyDebtPrincipalAmount: number;
};

export function R0Dashboard({
  snapshot,
  assetSnapshotSummary,
}: {
  snapshot: R0Snapshot;
  assetSnapshotSummary?: AssetSnapshotSummary;
}) {
  const livingCost = snapshot.fixed_expense + snapshot.variable_expense;
  const remainingAfterRegular = snapshot.total_income - livingCost - snapshot.regular_investment;
  const toManwon = (value: number) => Math.round(value / 10_000);
  const projectedMonth = formatMonth(snapshot.projected_fire_date);
  const heroState = snapshot.projected_fire_date
    ? snapshot.monthly_asset_growth_capacity < 0
      ? "caution"
      : "positive"
    : "unavailable";

  return (
    <div className="grid gap-4">
      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-fb-green">{formatMonth(snapshot.month)} 요약</p>
            <p className="mt-1 text-sm text-fb-muted">우리의 경제적 자유 현황을 한눈에 확인해요.</p>
          </div>
          <StatusPill label="참고용" status="info" />
        </div>
        <FireHeroCard
          dateLabel={projectedMonth}
          distanceLabel={snapshot.projected_fire_date ? "투자가능 순자산 기준" : undefined}
          state={heroState}
        />
        <p className="sr-only">투자가능 순자산 기준 예상 도달 시점은 {projectedMonth} 입니다.</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <MetricCard
          title="표시 순자산"
          value={formatKrw(snapshot.total_net_worth_for_display)}
          caption="거주 부동산 포함"
          variant="positive"
        />
        <MetricCard
          title="FIRE 계산 순자산"
          value={formatKrw(snapshot.fire_calculation_net_worth)}
          caption="투자가능 순자산 기준"
          variant="positive"
        />
        <MetricCard
          title="월 자산 증가 여력"
          value={formatKrw(snapshot.monthly_asset_growth_capacity)}
          caption="생활비와 정기저축/투자 반영"
          variant={snapshot.monthly_asset_growth_capacity < 0 ? "danger" : "positive"}
          size="sm"
        />
        <MetricCard
          title="FIRE 목표 자산"
          value={formatKrw(snapshot.fire_target_asset)}
          caption="연 생활비 × 25배 룰"
          size="sm"
        />
        <MetricCard
          title="거주 부동산 순자산"
          value={formatKrw(snapshot.primary_residence_net_worth)}
          caption="R0 FIRE 계산 제외"
          size="sm"
        />
        <MetricCard
          title="월 정기저축/투자"
          value={formatKrw(snapshot.regular_investment)}
          caption="매달 쌓이는 금액"
          variant="positive"
          size="sm"
        />
      </section>

      <CashflowSummary
        incomeMan={toManwon(snapshot.total_income)}
        livingCostMan={toManwon(livingCost)}
        regularInvestmentMan={toManwon(snapshot.regular_investment)}
        remainingMan={toManwon(remainingAfterRegular)}
      />

      {assetSnapshotSummary ? (
        <AssetSnapshotSummaryCard
          summary={assetSnapshotSummary}
          monthlyRegularInvestment={snapshot.regular_investment}
          remainingCash={snapshot.remaining_cash}
        />
      ) : null}

      {snapshot.projected_fire_date ? null : (
        <p className="rounded-card bg-fb-warning-bg px-4 py-3 text-sm leading-6 text-fb-ink">
          현재 입력 기준으로는 목표 도달 시점을 계산하기 어려워요. 월 자산 증가 여력이 생기면
          예상일을 보여드릴 수 있어요.
        </p>
      )}

      <p className="rounded-card border border-fb-line bg-fb-sand/70 px-4 py-3 text-sm leading-6 text-fb-muted">
        이 결과는 참고용 시뮬레이션이에요. 거주 부동산은 표시 순자산에는 포함하지만 R0 FIRE
        계산에서는 제외합니다. 연 5%, 25배 룰 기준이며 투자 자문이 아닙니다.
      </p>
    </div>
  );
}

function AssetSnapshotSummaryCard({
  summary,
  monthlyRegularInvestment,
  remainingCash,
}: {
  summary: AssetSnapshotSummary;
  monthlyRegularInvestment: number;
  remainingCash: number;
}) {
  const modeLabel = summary.mode === "current_estimate" ? "현재 추정치" : "월말 스냅샷";
  const valuationLabel = summary.valuationDate
    ? `자동평가 포함 · 마지막 거래일 ${summary.valuationDate} 기준`
    : "자동평가 가격 대기 중";
  const debtGrowthFormula =
    monthlyRegularInvestment + summary.monthlyDebtPrincipalAmount + remainingCash;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-fb-ink">{modeLabel}</p>
          <p className="mt-1 text-xs font-medium leading-5 text-fb-muted">{valuationLabel}</p>
        </div>
        <StatusPill label={summary.snapshotDate ?? "진행 중"} status="info" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricCard
          title="자동평가 투자자산"
          value={formatKrw(summary.investmentAssetAmount)}
          caption="국내 자동평가 + 수동 계산"
          size="sm"
          variant="positive"
        />
        <MetricCard
          title="차감 부채"
          value={formatKrw(summary.totalLiabilityAmount)}
          caption="표시 순자산 기준"
          size="sm"
        />
      </div>

      <p className="mt-3 rounded-card bg-fb-sand/70 px-4 py-3 text-sm leading-6 text-fb-muted">
        월 자산 증가 여력은 정기투자 + 빚 감소 + 남은 돈으로 봅니다. 현재 값은{" "}
        {formatKrw(debtGrowthFormula)}입니다.
      </p>
    </Card>
  );
}
