import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HistoryPage from "./page";

describe("HistoryPage", () => {
  it("shows a compact monthly snapshot card with remaining amount and month-over-month change", () => {
    render(<HistoryPage />);

    expect(screen.getByRole("heading", { name: "월별 체크인 기록" })).toBeInTheDocument();
    expect(screen.getByText("2026년 5월")).toBeInTheDocument();
    expect(screen.queryByText("2026년 5월 체크인")).not.toBeInTheDocument();
    expect(screen.getByText("FIRE까지 남은 금액")).toBeInTheDocument();
    expect(screen.getByText("7억 6,500만원")).toBeInTheDocument();
    expect(screen.getByText("↓ 320만원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "상세 정보 보기" })).toBeInTheDocument();
    expect(screen.getByText("FIRE 반영 순자산")).toBeInTheDocument();
    expect(screen.queryByText("임시 미리보기")).not.toBeInTheDocument();
    expect(screen.queryByText("확정 전")).not.toBeInTheDocument();
    expect(screen.queryByText(/실제 저장된 월별 기록이 아니라/)).not.toBeInTheDocument();
    expect(screen.queryByText("아직 저장된 월별 기록이 없어요.")).not.toBeInTheDocument();
  });
});
