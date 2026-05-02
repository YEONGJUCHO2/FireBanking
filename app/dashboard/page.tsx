import { BrandLockup, PageCanvas, StatusPill } from "@/components/fire-banking";
import { InvestmentAssetPanel } from "@/src/features/assets/components/InvestmentAssetPanel";
import { LiabilityPanel } from "@/src/features/assets/components/LiabilityPanel";
import { SignOutButton } from "@/src/features/auth/components/SignOutButton";
import { R0Dashboard } from "@/src/features/dashboard/components/R0Dashboard";

const dashboardSnapshot = {
  month: "2026-05-01",
  total_income: 7_200_000,
  investable_net_worth: 120_000_000,
  primary_residence_net_worth: 700_000_000,
  other_net_worth: 20_000_000,
  total_net_worth_for_display: 840_000_000,
  fire_calculation_net_worth: 139_000_000,
  fixed_expense: 2_300_000,
  variable_expense: 1_700_000,
  regular_investment: 2_000_000,
  remaining_cash: 1_200_000,
  monthly_asset_growth_capacity: 3_700_000,
  annual_fire_expense: 48_000_000,
  fire_target_asset: 1_200_000_000,
  projected_fire_date: "2035-05-01",
};

const assetSnapshotSummary = {
  mode: "current_estimate" as const,
  snapshotMonth: "2026-05-01",
  snapshotDate: null,
  valuationDate: "2026-05-29",
  displayedNetWorth: 839_000_000,
  fireCalculationNetWorth: 139_000_000,
  investmentAssetAmount: 140_000_000,
  totalLiabilityAmount: 1_000_000,
  monthlyDebtPrincipalAmount: 500_000,
};

export default function DashboardPage() {
  return (
    <PageCanvas>
      <div className="mx-auto grid w-full max-w-[1180px] gap-6">
        <header className="flex flex-col gap-4 border-b border-fb-line pb-5 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-4">
            <BrandLockup tagline />
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusPill label="현재 추정치" status="info" />
                <StatusPill label="자동평가 확장 준비" status="positive" />
              </div>
              <h1 className="text-[30px] font-bold leading-tight text-fb-ink md:text-[38px]">
                FIRE 대시보드
              </h1>
              <p className="mt-2 max-w-[42rem] text-[14px] font-medium leading-6 text-fb-ink-3">
                기존 R0 체크인 결과에 투자자산 자동평가와 단순 부채 모델을 붙여서,
                FIRE 예상일의 신뢰도를 먼저 확인하는 화면이에요.
              </p>
            </div>
          </div>
          <div className="w-full md:w-[128px]">
            <SignOutButton compact />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="min-w-0">
            <R0Dashboard snapshot={dashboardSnapshot} assetSnapshotSummary={assetSnapshotSummary} />
          </div>
          <div className="grid min-w-0 content-start gap-5">
            <InvestmentAssetPanel />
            <LiabilityPanel />
          </div>
        </section>
      </div>
    </PageCanvas>
  );
}
