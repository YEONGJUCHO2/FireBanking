import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingStepper } from "./onboarding-stepper";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("OnboardingStepper", () => {
  it("starts with the FIRE monthly spending goal instead of real estate assets", () => {
    render(<OnboardingStepper initial={{ goalExpense: 300 }} />);

    expect(screen.getByText(/은퇴 후 매달/)).toBeInTheDocument();
    expect(screen.getByText("현재 생활비 기준으로 시작")).toBeInTheDocument();
    expect(screen.getByText("고정비 시뮬레이터로 더 정확히 보기")).toBeInTheDocument();
    expect(screen.queryByText(/거주 부동산/)).not.toBeInTheDocument();
    expect(screen.queryByText(/기타 자산/)).not.toBeInTheDocument();
  });
});
