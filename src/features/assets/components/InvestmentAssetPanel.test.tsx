import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvestmentAssetPanel } from "./InvestmentAssetPanel";

describe("InvestmentAssetPanel", () => {
  it("shows domestic search, recommended instruments, and manual US-listed calculation", () => {
    render(<InvestmentAssetPanel />);

    expect(screen.getByText("투자자산")).toBeInTheDocument();
    expect(screen.getByText("종목 검색")).toBeInTheDocument();
    expect(screen.getByText("TIGER 미국S&P500")).toBeInTheDocument();
    expect(screen.queryByText("VOO")).not.toBeInTheDocument();
    expect(screen.getByText("미국상장 수동 계산")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수량 수정" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("shows an empty state with domestic ETF recommendations", () => {
    render(<InvestmentAssetPanel holdings={[]} />);

    expect(screen.getByText("아직 등록한 종목이 없어요.")).toBeInTheDocument();
    expect(screen.getByText("TIGER 미국S&P500")).toBeInTheDocument();
  });
});
