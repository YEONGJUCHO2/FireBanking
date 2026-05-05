import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

const mocks = vi.hoisted(() => ({
  getAssetManagementData: vi.fn(),
  getDashboardCashflowSnapshot: vi.fn(),
  getDashboardPartnerState: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@/src/features/assets/lib/getAssetManagementData", () => ({
  getAssetManagementData: mocks.getAssetManagementData,
}));

vi.mock("@/src/features/dashboard/lib/getDashboardCashflowSnapshot", () => ({
  getDashboardCashflowSnapshot: mocks.getDashboardCashflowSnapshot,
}));

vi.mock("@/src/features/dashboard/lib/getDashboardPartnerState", () => ({
  getDashboardPartnerState: mocks.getDashboardPartnerState,
}));

vi.mock("@/src/features/auth/lib/getCurrentUser", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/src/features/dashboard/components/AdminPartnerCard", () => ({
  AdminPartnerCard: ({ latestInviteUrl }: { latestInviteUrl?: string }) => (
    <section>
      <h2>배우자에게 공유할 준비</h2>
      {latestInviteUrl ? <p>{latestInviteUrl}</p> : null}
    </section>
  ),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    mocks.getAssetManagementData.mockReset();
    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: null,
      holdings: undefined,
      liabilities: undefined,
    });
    mocks.getDashboardCashflowSnapshot.mockReset();
    mocks.getDashboardCashflowSnapshot.mockResolvedValue(null);
    mocks.getDashboardPartnerState.mockReset();
    mocks.getDashboardPartnerState.mockResolvedValue({
      state: "needs_invite",
      coupleId: "couple-1",
      connectedPartnerCount: 0,
      latestInviteUrl: "/invite/token-1",
    });
    mocks.getCurrentUser.mockReset();
    mocks.getCurrentUser.mockResolvedValue(null);
  });

  it("keeps asset and liability management panels out of the home dashboard", async () => {
    render(await DashboardPage());

    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
    expect(screen.getAllByText("이번 달 부부 체크인").length).toBeGreaterThan(0);
    expect(screen.getByText("이번 달 결과를 같이 봐요.")).toBeInTheDocument();
    expect(screen.getAllByText("FIRE까지 남은 금액").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "기간" }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "기간" })[0]);
    expect(screen.getAllByText("FIRE까지 남은 기간").length).toBeGreaterThan(0);
    expect(screen.getAllByText("목표 월 생활비").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FIRE 목표자산").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FIRE 자산 진단").length).toBeGreaterThan(0);
    const mobileDashboard = document.querySelector(".lg\\:hidden");
    expect(mobileDashboard?.textContent?.indexOf("FIRE 생활비 조정기")).toBeLessThan(
      mobileDashboard?.textContent?.indexOf("FIRE 자산 진단") ?? -1,
    );
    expect(screen.getAllByRole("link", { name: /FIRE 자산 진단/ })[0]).toHaveAttribute(
      "href",
      "/assets",
    );
    expect(screen.queryByText("종목 검색")).not.toBeInTheDocument();
    expect(screen.queryByText("부채 수정")).not.toBeInTheDocument();
    expect(screen.queryByText("검색 준비중")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("2026. 04. 체크인");
    expect(document.body).not.toHaveTextContent("2026 APRIL");
    expect(document.body).not.toHaveTextContent("지윤");
    expect(document.body).not.toHaveTextContent("민호");
  });

  it("hides the spouse card after the partner has completed the current input", async () => {
    mocks.getDashboardPartnerState.mockResolvedValue({
      state: "complete",
      coupleId: "couple-1",
      connectedPartnerCount: 1,
    });

    render(await DashboardPage());

    expect(screen.queryByText("배우자 초대")).not.toBeInTheDocument();
    expect(screen.queryByText("배우자에게 공유할 준비")).not.toBeInTheDocument();
    expect(screen.queryByText("초대 수락 · 입력 대기 중")).not.toBeInTheDocument();
  });

  it("shows the spouse invite workflow in the desktop dashboard when a partner is pending", async () => {
    render(await DashboardPage());

    const desktopDashboard = document.querySelector(".lg\\:block");

    expect(desktopDashboard).toHaveTextContent("배우자 초대");
    expect(desktopDashboard).toHaveTextContent("배우자에게 공유할 준비");
    expect(desktopDashboard).toHaveTextContent("/invite/token-1");
  });

  it("links registered assets to dashboard net worth while excluding pension and IRP from FIRE assets", async () => {
    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: "couple-1",
      holdings: [
        {
          id: "holding-general",
          symbol: "003670",
          displayName: "포스코퓨처엠",
          quantity: 1,
          valuationAmount: 2_520_000,
          valuationDate: "2026-04-30",
          accountCategory: "general",
        },
        {
          id: "holding-pension",
          symbol: "360750",
          displayName: "TIGER 미국S&P500",
          quantity: 10,
          valuationAmount: 261_600,
          valuationDate: "2026-04-30",
          accountCategory: "pension_savings",
        },
        {
          id: "holding-irp",
          symbol: "453850",
          displayName: "ACE 미국S&P500채권혼합액티브",
          quantity: 5,
          valuationAmount: 50_000,
          valuationDate: "2026-04-30",
          accountCategory: "irp",
        },
      ],
      liabilities: [],
    });

    render(await DashboardPage());

    expect(screen.getAllByText("FIRE 계산 순자산").length).toBeGreaterThan(0);
    expect(screen.getAllByText("252").length).toBeGreaterThan(0);
    expect(screen.queryByText("거주 부동산")).not.toBeInTheDocument();
    expect(screen.queryByText("기타 순자산")).not.toBeInTheDocument();
    expect(screen.queryByText("연금/IRP 별도")).not.toBeInTheDocument();
    expect(screen.getAllByText(/3개 투자자산이 FIRE 금액에 반영 중/).length).toBeGreaterThan(0);
  });

  it("subtracts only investment-linked loans from dashboard FIRE reflected assets", async () => {
    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: "couple-1",
      holdings: [
        {
          id: "holding-general",
          symbol: "003670",
          displayName: "포스코퓨처엠",
          quantity: 1,
          valuationAmount: 50_000_000,
          valuationDate: "2026-04-30",
          accountCategory: "general",
        },
        {
          id: "holding-pension",
          symbol: "360750",
          displayName: "TIGER 미국S&P500",
          quantity: 10,
          valuationAmount: 10_000_000,
          valuationDate: "2026-04-30",
          accountCategory: "pension_savings",
        },
      ],
      liabilities: [
        {
          id: "stock-loan",
          label: "주식담보대출",
          purposeLabel: "투자 관련",
          balanceAmount: 15_000_000,
          monthlyInterestAmount: 100_000,
          monthlyPrincipalAmount: 300_000,
          purpose: "investment",
        },
        {
          id: "credit-loan",
          label: "생활 신용대출",
          purposeLabel: "생활 신용",
          balanceAmount: 5_000_000,
          monthlyInterestAmount: 50_000,
          monthlyPrincipalAmount: 200_000,
          purpose: "lifestyle_credit",
        },
      ],
    });

    render(await DashboardPage());

    expect(screen.getAllByText("FIRE 계산 순자산").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3,500").length).toBeGreaterThan(0);
  });

  it("reflects applied living expense snapshot values on the dashboard", async () => {
    mocks.getDashboardCashflowSnapshot.mockResolvedValue({
      total_income: 7_200_000,
      investable_net_worth: 120_000_000,
      primary_residence_net_worth: 0,
      other_net_worth: 0,
      total_net_worth_for_display: 120_000_000,
      fire_calculation_net_worth: 120_000_000,
      fixed_expense: 1_000_000,
      variable_expense: 1_100_000,
      regular_investment: 2_000_000,
      monthly_asset_growth_capacity: 3_100_000,
      annual_fire_expense: 25_200_000,
      fire_target_asset: 630_000_000,
    });

    render(await DashboardPage());

    expect(screen.getAllByText("월 210만원 생활비 기준 · 연 5%, 25배 룰").length).toBeGreaterThan(0);
    expect(screen.getAllByText("63,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText(exactNormalizedText("−100만원")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(exactNormalizedText("−110만원")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(exactNormalizedText("+310만원")).length).toBeGreaterThan(0);
  });
});

function exactNormalizedText(expected: string) {
  return (_content: string, element: Element | null) =>
    element?.textContent?.replace(/\s+/g, "") === expected;
}
