import Link from "next/link";
import {
  BottomNav,
  DashboardFireOverview,
  DesktopDashboard,
  MobileAppShell,
  ScreenTopBar,
  StatusPill,
} from "@/components/fire-banking";
import { getAssetManagementData } from "@/src/features/assets/lib/getAssetManagementData";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { getUserAvatar } from "@/src/features/auth/lib/getUserAvatar";
import {
  getDashboardCashflowSnapshot,
  type DashboardCashflowSnapshot,
} from "@/src/features/dashboard/lib/getDashboardCashflowSnapshot";
import { getDashboardPartnerState } from "@/src/features/dashboard/lib/getDashboardPartnerState";
import { formatCheckinMonthLabel } from "@/src/lib/checkinDate";

type DashboardData = typeof baseData & {
  linkedAssetCount: number;
};

const baseData = {
  totalNetWorthMan: 51_500,
  netWorthDeltaMan: 320,
  homeMan: 38_000,
  investableMan: 13_500,
  otherMan: 1_500,
  targetMonthlyExpenseMan: 300,
  fireTargetMan: 90_000,
  incomeMan: 850,
  fixedMan: 350,
  variableMan: 220,
  saveMan: 180,
  monthlyAddMan: 280,
  fireYears: 8,
  fireMonths: 4,
};

export default async function DashboardPage() {
  const [assetData, cashflowSnapshot, partnerState, currentUser] = await Promise.all([
    getAssetManagementData(),
    getDashboardCashflowSnapshot(),
    getDashboardPartnerState(),
    getCurrentUser(),
  ]);
  const avatar = getUserAvatar(currentUser);
  const data = withFireDistance(deriveDashboardData(assetData, cashflowSnapshot));
  const percent = Math.max(0, Math.min(1, data.investableMan / data.fireTargetMan));
  const pendingPartnerState =
    partnerState.state === "needs_invite" || partnerState.state === "waiting_for_input"
      ? partnerState
      : null;
  const partnerPending = Boolean(pendingPartnerState);

  return (
    <>
      <div className="lg:hidden">
        <MobileAppShell>
          <ScreenTopBar
            right={
              <Link
                href="/settings"
                aria-label={`설정 — ${avatar.alt}`}
                data-od-id="nav-profile"
                className="fbpress flex size-9 items-center justify-center overflow-hidden rounded-full bg-fb-ink hover:opacity-90"
              >
                {avatar.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar.url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-[12px] font-bold text-white">{avatar.initial}</span>
                )}
              </Link>
            }
          />

          <main className="flex-1 overflow-auto px-4 pb-28 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
                {formatCheckinMonthLabel()}
              </div>
              <StatusPill
                tone="trust"
                icon={<span className="size-1.5 rounded-full bg-fb-trust" />}
              >
                이번 달 진행 중
              </StatusPill>
            </div>

            <DashboardFireOverview
              percent={percent}
              targetMonthlyExpenseManWon={data.targetMonthlyExpenseMan}
              fireNetWorthManWon={data.investableMan}
              monthlyGrowthManWon={data.monthlyAddMan}
              fireTargetManWon={data.fireTargetMan}
              years={data.fireYears}
              months={data.fireMonths}
            />
          </main>

          <BottomNav active="home" partnerPending={partnerPending} />
        </MobileAppShell>
      </div>

      <div className="hidden min-h-dvh bg-fb-page px-8 py-10 lg:block">
        <DesktopDashboard
          data={{ ...data, netDeltaMan: data.netWorthDeltaMan }}
          avatar={avatar}
        />
      </div>
    </>
  );
}

function deriveDashboardData({
  holdings,
  liabilities,
}: {
  holdings?: Array<{
    valuationAmount: number;
    accountCategory?: "general" | "pension_savings" | "irp" | "other";
  }>;
  liabilities?: Array<{
    balanceAmount: number;
    purpose?: "residence" | "investment" | "lifestyle_credit" | "other";
  }>;
}, cashflowSnapshot?: DashboardCashflowSnapshot | null): DashboardData {
  const registeredHoldings = holdings ?? [];
  const registeredLiabilities = liabilities ?? [];
  const cashflowData = cashflowSnapshot ? dashboardDataFromSnapshot(cashflowSnapshot) : baseData;

  if (registeredHoldings.length === 0 && registeredLiabilities.length === 0) {
    return { ...cashflowData, linkedAssetCount: 0 };
  }

  const displayedHoldingAmount = registeredHoldings.reduce(
    (total, holding) => total + holding.valuationAmount,
    0,
  );
  const fireIncludedHoldingAmount = registeredHoldings
    .filter((holding) => !isRetirementAccount(holding.accountCategory))
    .reduce((total, holding) => total + holding.valuationAmount, 0);
  const totalLiabilityAmount = registeredLiabilities.reduce(
    (total, liability) => total + liability.balanceAmount,
    0,
  );
  const fireIncludedLiabilityAmount = registeredLiabilities
    .filter((liability) => liability.purpose === "investment")
    .reduce((total, liability) => total + liability.balanceAmount, 0);

  const totalNetWorthMan = Math.round(
    (cashflowData.homeMan * 10_000 + cashflowData.otherMan * 10_000 + displayedHoldingAmount - totalLiabilityAmount) /
      10_000,
  );
  const investableMan = Math.max(
    0,
    Math.round((fireIncludedHoldingAmount - fireIncludedLiabilityAmount) / 10_000),
  );

  return {
    ...cashflowData,
    totalNetWorthMan,
    investableMan,
    otherMan: cashflowData.otherMan,
    linkedAssetCount: registeredHoldings.length,
  };
}

function toManWon(value: number) {
  return Math.round(value / 10_000);
}

function dashboardDataFromSnapshot(snapshot: DashboardCashflowSnapshot): typeof baseData {
  return {
    totalNetWorthMan: toManWon(snapshot.total_net_worth_for_display),
    netWorthDeltaMan: baseData.netWorthDeltaMan,
    homeMan: toManWon(snapshot.primary_residence_net_worth),
    investableMan: toManWon(snapshot.fire_calculation_net_worth),
    otherMan: toManWon(snapshot.other_net_worth),
    targetMonthlyExpenseMan: toManWon(snapshot.annual_fire_expense / 12),
    fireTargetMan: toManWon(snapshot.fire_target_asset),
    incomeMan: toManWon(snapshot.total_income),
    fixedMan: toManWon(snapshot.fixed_expense),
    variableMan: toManWon(snapshot.variable_expense),
    saveMan: toManWon(snapshot.regular_investment),
    monthlyAddMan: toManWon(snapshot.monthly_asset_growth_capacity),
    fireYears: baseData.fireYears,
    fireMonths: baseData.fireMonths,
  };
}

function isRetirementAccount(accountCategory?: "general" | "pension_savings" | "irp" | "other") {
  return accountCategory === "pension_savings" || accountCategory === "irp";
}

function withFireDistance<T extends typeof baseData & { linkedAssetCount: number }>(data: T): T {
  const monthsToFire = calculateMonthsToFire({
    currentMan: data.investableMan,
    targetMan: data.fireTargetMan,
    monthlyGrowthMan: data.monthlyAddMan,
  });

  if (monthsToFire == null) {
    return { ...data, fireYears: 0, fireMonths: 0 };
  }

  return {
    ...data,
    fireYears: Math.floor(monthsToFire / 12),
    fireMonths: monthsToFire % 12,
  };
}

function calculateMonthsToFire({
  currentMan,
  targetMan,
  monthlyGrowthMan,
}: {
  currentMan: number;
  targetMan: number;
  monthlyGrowthMan: number;
}) {
  if (currentMan >= targetMan) {
    return 0;
  }

  if (monthlyGrowthMan <= 0) {
    return null;
  }

  const monthlyReturnRate = Math.pow(1.05, 1 / 12) - 1;
  let simulated = currentMan;

  for (let month = 1; month <= 12 * 100; month += 1) {
    simulated = simulated * (1 + monthlyReturnRate) + monthlyGrowthMan;
    if (simulated >= targetMan) {
      return month;
    }
  }

  return null;
}
