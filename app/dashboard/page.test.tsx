import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("renders the OD dashboard design with investment and liability extensions", () => {
    render(<DashboardPage />);

    expect(screen.getByText("안녕하세요, 지윤님")).toBeInTheDocument();
    expect(screen.getAllByText("이번 달 부부 체크인").length).toBeGreaterThan(0);
    expect(screen.getByText("이번 달 결과를 같이 봐요.")).toBeInTheDocument();
    expect(screen.getAllByText("투자자산").length).toBeGreaterThan(0);
    expect(screen.getAllByText("부채").length).toBeGreaterThan(0);
    expect(screen.getAllByText("검색 준비중").length).toBeGreaterThan(0);
  });
});
