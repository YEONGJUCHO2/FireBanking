import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("keeps asset and liability management panels out of the home dashboard", () => {
    render(<DashboardPage />);

    expect(screen.getByText("안녕하세요, 지윤님")).toBeInTheDocument();
    expect(screen.getAllByText("이번 달 부부 체크인").length).toBeGreaterThan(0);
    expect(screen.getByText("이번 달 결과를 같이 봐요.")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /자산·부채 관리/ })[0]).toHaveAttribute(
      "href",
      "/assets",
    );
    expect(screen.queryByText("종목 검색")).not.toBeInTheDocument();
    expect(screen.queryByText("부채 수정")).not.toBeInTheDocument();
    expect(screen.queryByText("검색 준비중")).not.toBeInTheDocument();
  });
});
