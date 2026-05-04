import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HistoryPage from "./page";

describe("HistoryPage", () => {
  it("shows an empty state instead of sample monthly records", () => {
    render(<HistoryPage />);

    expect(screen.getByRole("heading", { name: "월별 체크인 기록" })).toBeInTheDocument();
    expect(screen.getByText("아직 저장된 월별 기록이 없어요.")).toBeInTheDocument();
    expect(screen.getByText(/온보딩 완료나 이번 달 값 수정으로 저장된 현금흐름 스냅샷/)).toBeInTheDocument();
    expect(screen.getByText(/자산 가격 스냅샷은 월말 자동 작업/)).toBeInTheDocument();
    expect(screen.queryByText("2026. 04")).not.toBeInTheDocument();
    expect(screen.queryByText("5억 1,500만원")).not.toBeInTheDocument();
  });
});
