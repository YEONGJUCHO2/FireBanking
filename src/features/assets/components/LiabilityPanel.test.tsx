import { render, screen } from "@testing-library/react";
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
});
