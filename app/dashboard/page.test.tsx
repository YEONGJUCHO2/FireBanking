import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("renders the current app dashboard instead of the legacy showcase mock", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { name: "FIRE 대시보드" })).toBeInTheDocument();
    expect(screen.getByText("투자자산")).toBeInTheDocument();
    expect(screen.getByText("부채")).toBeInTheDocument();
    expect(screen.getByText("FIRE 계산 순자산")).toBeInTheDocument();
    expect(screen.queryByText("안녕하세요, 지윤님")).not.toBeInTheDocument();
    expect(screen.queryByText("이번 달 결과를 같이 봐요.")).not.toBeInTheDocument();
  });
});
