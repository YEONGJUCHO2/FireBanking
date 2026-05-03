import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

const mocks = vi.hoisted(() => ({
  getAssetManagementData: vi.fn(),
}));

vi.mock("@/src/features/assets/lib/getAssetManagementData", () => ({
  getAssetManagementData: mocks.getAssetManagementData,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    mocks.getAssetManagementData.mockReset();
    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: null,
      holdings: undefined,
      liabilities: undefined,
    });
  });

  it("keeps asset and liability management panels out of the home dashboard", async () => {
    render(await DashboardPage());

    expect(screen.getByText("안녕하세요, 지윤님")).toBeInTheDocument();
    expect(screen.getAllByText("이번 달 부부 체크인").length).toBeGreaterThan(0);
    expect(screen.getByText("이번 달 결과를 같이 봐요.")).toBeInTheDocument();
    expect(screen.getAllByText("FIRE까지 남은 금액").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "기간" }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "기간" })[0]);
    expect(screen.getAllByText("FIRE까지 남은 기간").length).toBeGreaterThan(0);
    expect(screen.getAllByText("목표 월 생활비").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FIRE 목표자산").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FIRE 자산 진단").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /FIRE 자산 진단/ })[0]).toHaveAttribute(
      "href",
      "/assets",
    );
    expect(screen.queryByText("종목 검색")).not.toBeInTheDocument();
    expect(screen.queryByText("부채 수정")).not.toBeInTheDocument();
    expect(screen.queryByText("검색 준비중")).not.toBeInTheDocument();
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
});
