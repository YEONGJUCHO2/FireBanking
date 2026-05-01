import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { R0Dashboard } from "./R0Dashboard";

const snapshot = {
  month: "2026-04-01",
  total_income: 7_200_000,
  investable_net_worth: 120_000_000,
  primary_residence_net_worth: 700_000_000,
  other_net_worth: 20_000_000,
  total_net_worth_for_display: 840_000_000,
  fire_calculation_net_worth: 120_000_000,
  fixed_expense: 2_300_000,
  variable_expense: 1_700_000,
  regular_investment: 2_000_000,
  remaining_cash: 1_200_000,
  monthly_asset_growth_capacity: 3_200_000,
  annual_fire_expense: 48_000_000,
  fire_target_asset: 1_200_000_000,
  projected_fire_date: "2035-05-01",
};

const assetSnapshotSummary = {
  mode: "fixed_month_end" as const,
  snapshotMonth: "2026-05-01",
  snapshotDate: "2026-05-31",
  valuationDate: "2026-05-29",
  displayedNetWorth: 161_000_000,
  fireCalculationNetWorth: 139_000_000,
  investmentAssetAmount: 140_000_000,
  totalLiabilityAmount: 1_000_000,
  monthlyDebtPrincipalAmount: 500_000,
};

describe("R0Dashboard", () => {
  it("shows the projected FIRE month when projected_fire_date exists", () => {
    render(<R0Dashboard snapshot={snapshot} />);

    expect(screen.getByText(/예상 도달 시점은 2035년 5월/)).toBeInTheDocument();
  });

  it("shows the calculation-impossible recovery message when projected_fire_date is null", () => {
    render(<R0Dashboard snapshot={{ ...snapshot, projected_fire_date: null }} />);

    expect(screen.getByText(/목표 도달 시점을 계산하기 어려워요/)).toBeInTheDocument();
  });

  it("formats KRW values without decimals", () => {
    render(<R0Dashboard snapshot={snapshot} />);

    expect(screen.getByText("₩1,200,000,000")).toBeInTheDocument();
  });

  it("shows asset valuation snapshot summary when available", () => {
    render(<R0Dashboard snapshot={snapshot} assetSnapshotSummary={assetSnapshotSummary} />);

    expect(screen.getByText("월말 스냅샷")).toBeInTheDocument();
    expect(screen.getByText(/마지막 거래일 2026-05-29 기준/)).toBeInTheDocument();
    expect(screen.getByText(/정기투자 \+ 빚 감소 \+ 남은 돈/)).toBeInTheDocument();
  });

  it("shows current estimate mode distinctly", () => {
    render(
      <R0Dashboard
        snapshot={snapshot}
        assetSnapshotSummary={{ ...assetSnapshotSummary, mode: "current_estimate", snapshotDate: null }}
      />,
    );

    expect(screen.getByText("현재 추정치")).toBeInTheDocument();
  });

  it("renders existing R0 dashboard when asset snapshot summary is missing", () => {
    render(<R0Dashboard snapshot={snapshot} />);

    expect(screen.getByText(/우리의 경제적 자유 현황/)).toBeInTheDocument();
    expect(screen.queryByText("월말 스냅샷")).not.toBeInTheDocument();
  });

  it("does not invent asset auto-valuation history for months before monthly_asset_snapshots exist", () => {
    render(<R0Dashboard snapshot={snapshot} assetSnapshotSummary={undefined} />);

    expect(screen.queryByText(/자동평가 포함/)).not.toBeInTheDocument();
  });
});
