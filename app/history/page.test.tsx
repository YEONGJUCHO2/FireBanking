import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HistoryPage from "./page";

describe("HistoryPage", () => {
  it("shows the header and explicit empty state when no history data exists", () => {
    render(<HistoryPage />);

    // Header always visible
    expect(screen.getByRole("heading", { name: "월별 체크인 기록" })).toBeInTheDocument();

    // Empty state is shown because rows = [] (no Supabase data)
    expect(screen.getByText("아직 저장된 기록이 없어요")).toBeInTheDocument();
    expect(screen.getByText(/매달 체크인이 마감되면/)).toBeInTheDocument();

    // No hard-coded fake history rendered as real user data
    expect(screen.queryByText("2026년 5월")).not.toBeInTheDocument();
    expect(screen.queryByText("FIRE까지 남은 금액")).not.toBeInTheDocument();
    expect(screen.queryByText("7억 6,500만원")).not.toBeInTheDocument();
    expect(screen.queryByText("↓ 320만원")).not.toBeInTheDocument();
  });
});
