import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardMobilePage from "./page";

describe("DashboardMobilePage", () => {
  it("renders the mobile dashboard shell on a dedicated route", () => {
    render(<DashboardMobilePage />);

    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
    expect(screen.getByText("이번 달 부부 체크인")).toBeInTheDocument();
    expect(screen.getAllByText("FIRE까지 남은 금액").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "기간" })).toBeInTheDocument();
    expect(screen.getAllByText("목표 월 생활비").length).toBeGreaterThan(0);
    expect(screen.getByText("FIRE 생활비 조정기")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "분석" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("2026. 04. 체크인");
    expect(document.body).not.toHaveTextContent("지윤");
    expect(document.body).not.toHaveTextContent("민호");
  });
});
