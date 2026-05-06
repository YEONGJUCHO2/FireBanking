import Link from "next/link";
import {
  BottomNav,
  CashflowSummary,
  DashboardFireOverview,
  DesktopDashboard,
  MobileAppShell,
  ScreenTopBar,
  StatusPill,
} from "@/components/fire-banking";
import { Card, SectionHeader } from "@/components/fire-banking/card";
import { CheckinRow } from "@/components/fire-banking/checkin-row";
import { Icon } from "@/components/fire-banking/icons";
import { getAssetManagementData } from "@/src/features/assets/lib/getAssetManagementData";
import { SignOutButton } from "@/src/features/auth/components/SignOutButton";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { getUserAvatar } from "@/src/features/auth/lib/getUserAvatar";
import { AdminPartnerCard } from "@/src/features/dashboard/components/AdminPartnerCard";
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
              <button
                aria-label="설정"
                className="fbpress flex size-11 items-center justify-center rounded-full text-fb-ink-2 hover:bg-fb-card-alt"
              >
                <Icon name="settings" className="size-5" />
              </button>
            }
          />

          <main className="flex-1 overflow-auto px-4 pb-28 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
                  {formatCheckinMonthLabel()}
                </div>
                <div className="mt-0.5 text-[18px] font-bold tracking-[-0.012em] text-fb-ink">
                  안녕하세요
                </div>
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

            <div className="mt-6">
              <Card radius="hero" className="p-5">
                <div className="mb-3 h-[2px] w-6 rounded-[2px] bg-fb-ink" />
                <h3 className="text-[16px] font-bold text-fb-ink">이번 달 부부 체크인</h3>
                <div className="mt-3">
                  <CheckinRow name="나" role="admin" status="done" when="오늘 14:08 입력" />
                  <div className="fb-divider" />
                  <CheckinRow
                    name="배우자"
                    role="lite"
                    status="pending"
                    when="초대 수락 · 입력 대기 중"
                  />
                  <div className="mt-3 rounded-[12px] bg-fb-cautionary-soft p-3 text-[12px] font-medium leading-[1.5] text-fb-cautionary-ink">
                    배우자 체크인이 완료되면 이번 달 결과가 확정돼요.
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <CashflowSummary
                incomeMan={data.incomeMan}
                fixedMan={data.fixedMan}
                variableMan={data.variableMan}
                regularInvestmentMan={data.saveMan}
                remainingMan={data.monthlyAddMan}
              />
            </div>

            <FireLivingExpenseAdjusterLink />

            <AssetManagementLink linkedAssetCount={data.linkedAssetCount} />

            {pendingPartnerState ? (
              <section className="mt-6 space-y-3">
                <SectionHeader title="배우자 초대" />
                <AdminPartnerCard
                  coupleId={pendingPartnerState.coupleId}
                  connectedPartnerCount={pendingPartnerState.connectedPartnerCount}
                  latestInviteUrl={pendingPartnerState.latestInviteUrl}
                />
              </section>
            ) : null}

            <div className="mt-6">
              <SignOutButton />
            </div>
          </main>

          <BottomNav active="home" partnerPending={partnerPending} />
        </MobileAppShell>
      </div>

      <div className="hidden min-h-dvh bg-fb-page px-8 py-10 lg:block">
        <DesktopDashboard
          footerAction={<SignOutButton />}
          data={{ ...data, netDeltaMan: data.netWorthDeltaMan }}
          avatar={avatar}
        />
        <div className="mx-auto mt-6 w-full max-w-[1280px]">
          <FireLivingExpenseAdjusterLink />
          <AssetManagementLink linkedAssetCount={data.linkedAssetCount} />
          {pendingPartnerState ? (
            <section className="mt-4 space-y-3">
              <SectionHeader title="배우자 초대" />
              <AdminPartnerCard
                coupleId={pendingPartnerState.coupleId}
                connectedPartnerCount={pendingPartnerState.connectedPartnerCount}
                latestInviteUrl={pendingPartnerState.latestInviteUrl}
              />
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}

function FireLivingExpenseAdjusterLink() {
  return (
    <Link
      href="/subscribe"
      className="fbpress mt-4 flex items-center gap-3.5 rounded-[20px] border border-fb-line bg-white p-5"
    >
      <span className="flex size-11 items-center justify-center rounded-[14px] bg-fb-trust-soft text-fb-trust-ink">
        <Icon name="refresh" className="size-[22px]" />
      </span>
      <span className="flex-1">
        <span className="block text-[14px] font-bold text-fb-ink">FIRE 생활비 조정기</span>
        <span className="mt-0.5 block text-[12px] font-medium text-fb-ink-3">
          고정비·변동비·버퍼로 목표 생활비 조정
        </span>
      </span>
      <Icon name="chevron-right" className="size-5 text-fb-ink-3" />
    </Link>
  );
}

function AssetManagementLink({ linkedAssetCount }: { linkedAssetCount?: number }) {
  return (
    <Link
      href="/assets"
      className="fbpress mt-4 flex items-center gap-3.5 rounded-[20px] border border-fb-line bg-white p-5"
    >
      <span className="flex size-11 items-center justify-center rounded-[14px] bg-fb-trust-soft text-fb-trust-ink">
        <Icon name="wallet" className="size-[22px]" />
      </span>
      <span className="flex-1">
        <span className="block text-[14px] font-bold text-fb-ink">FIRE 자산 진단</span>
        <span className="mt-0.5 block text-[12px] font-medium text-fb-ink-3">
          {linkedAssetCount
            ? `${linkedAssetCount.toLocaleString("ko-KR")}개 투자자산이 FIRE 금액에 반영 중`
            : "투자자산과 투자 연동 대출을 분리해요"}
        </span>
      </span>
      <Icon name="chevron-right" className="size-5 text-fb-ink-3" />
    </Link>
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
