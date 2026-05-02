import { fireEvent, render, screen } from "@testing-library/react";
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

  it("lets a user search, add, edit quantity, and delete holdings in the alpha panel", () => {
    render(<InvestmentAssetPanel holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "삼성" } });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));
    fireEvent.click(screen.getByRole("button", { name: "삼성전자 추가" }));

    expect(screen.getAllByText("삼성전자").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "수량 수정" }));
    fireEvent.change(screen.getByLabelText("삼성전자 보유 수량"), { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.getByText(/25주/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(screen.queryByText(/25주/)).not.toBeInTheDocument();
    expect(screen.getByText("아직 등록한 종목이 없어요.")).toBeInTheDocument();
  });
});
