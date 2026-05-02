import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LiabilityPanel } from "./LiabilityPanel";

describe("LiabilityPanel", () => {
  it("shows liability policy copy and edit affordance", () => {
    render(<LiabilityPanel />);

    expect(screen.getByText("부채")).toBeInTheDocument();
    expect(screen.getByText(/이자는 비용으로 보고/)).toBeInTheDocument();
    expect(screen.getByText(/원금상환은 빚이 줄어드는 효과/)).toBeInTheDocument();
    expect(screen.getByText(/은행 앱의 상환 안내/)).toBeInTheDocument();
    expect(screen.getByText(/거주 부동산 관련/)).toBeInTheDocument();
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
    expect(screen.getAllByText("₩330,000").length).toBeGreaterThan(0);
  });
});
