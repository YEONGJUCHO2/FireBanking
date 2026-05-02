import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { R0OnboardingForm } from "./R0OnboardingForm";

vi.mock("@/src/features/onboarding/actions/saveR0Snapshot", () => ({
  saveR0Snapshot: vi.fn(),
}));

describe("R0OnboardingForm", () => {
  it("shows manwon suffixes and formats money inputs with comma separators", () => {
    render(<R0OnboardingForm />);

    expect(screen.getAllByText("만원")).toHaveLength(6);

    const investableNetWorth = screen.getByRole("textbox", { name: "내 투자가능 순자산" });
    fireEvent.change(investableNetWorth, { target: { value: "12000" } });

    expect(investableNetWorth).toHaveValue("12,000");
  });

  it("pre-fills saved Korean won values as comma-formatted manwon inputs", () => {
    render(
      <R0OnboardingForm
        initialValues={{
          targetMonthlyExpense: 3_000_000,
          monthlyNetIncome: 7_200_000,
          investableNetWorth: 120_000_000,
          monthlyFixedExpense: 2_300_000,
          monthlyVariableExpense: 1_700_000,
          monthlyRegularInvestment: 2_000_000,
        }}
      />,
    );

    expect(screen.getByRole("textbox", { name: "목표 월 생활비" })).toHaveValue("300");
    expect(screen.getByRole("textbox", { name: "가구 세후 월수입" })).toHaveValue("720");
    expect(screen.getByRole("textbox", { name: "내 투자가능 순자산" })).toHaveValue("12,000");
    expect(screen.queryByRole("textbox", { name: "거주 부동산 순자산" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "기타 순자산" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "가구 월 고정비 총액" })).toHaveValue("230");
    expect(screen.getByRole("textbox", { name: "평소 한 달 예상 변동비" })).toHaveValue("170");
    expect(screen.getByRole("textbox", { name: "월 정기저축/투자" })).toHaveValue("200");
  });
});
