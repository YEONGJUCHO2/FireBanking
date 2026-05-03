import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiabilityPanel } from "./LiabilityPanel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("LiabilityPanel", () => {
  it("shows liability policy copy and edit affordance", () => {
    render(<LiabilityPanel />);

    expect(screen.getByText("투자 연동 대출")).toBeInTheDocument();
    expect(screen.getByText(/투자자산을 만들기 위해 낀 대출만 FIRE 반영 투자자산에서 차감해요/)).toBeInTheDocument();
    expect(screen.getByText("차감 대상 대출")).toBeInTheDocument();
    expect(screen.getByText("월 이자")).toBeInTheDocument();
    expect(screen.getByText("월 원금상환")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "부채 수정" })).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<LiabilityPanel liabilities={[]} />);

    expect(screen.getByText("등록한 부채가 없어요.")).toBeInTheDocument();
  });

  it("lets a user edit liability balance and monthly repayment flow in the alpha panel", () => {
    render(<LiabilityPanel />);

    fireEvent.click(screen.getByRole("button", { name: "부채 수정" }));
    fireEvent.change(screen.getByLabelText("투자 관련 대출 잔액"), { target: { value: "1200" } });
    fireEvent.change(screen.getByLabelText("투자 관련 대출 월 이자"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("투자 관련 대출 월 원금상환"), { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.getAllByText("₩12,000,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₩80,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₩250,000").length).toBeGreaterThan(0);
  });
});
